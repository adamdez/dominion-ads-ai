import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getProposalById,
  updateProposalStatus,
  insertProposalAction,
} from '@/database/queries/proposals';
import { logger } from '@/lib/logger';
import type { ProposalStatus } from '@/types/campaign-proposals';

// ── Valid actions from the UI ───────────────────────────────────
// The proposal review UI sends 'approved' | 'edits_requested' | 'rejected'.
// Each action maps to the corresponding ProposalStatus enum value.

const ACTION_TO_STATUS: Record<string, ProposalStatus> = {
  approved: 'approved',
  edits_requested: 'edits_requested',
  rejected: 'rejected',
};

const VALID_ACTIONS = new Set(Object.keys(ACTION_TO_STATUS));

// TODO: Replace with real auth. When auth is added, extract user identity
// from session/JWT. Currently every action is attributed to 'operator'.
const TEMP_OPERATOR_IDENTITY = 'operator';

// ── GET — Fetch a single proposal ──────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const proposal = await getProposalById(supabase, id);

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({ proposal });
  } catch (err: unknown) {
    const message = extractErrorMessage(err);
    logger.error('Failed to fetch proposal', { proposalId: id, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── PATCH — Update proposal status ─────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });
  }

  let body: { action?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action, reason } = body;
  if (!action || !VALID_ACTIONS.has(action)) {
    return NextResponse.json(
      { error: `Invalid action. Expected one of: ${[...VALID_ACTIONS].join(', ')}` },
      { status: 400 }
    );
  }

  const newStatus = ACTION_TO_STATUS[action];

  try {
    const supabase = await createServerSupabaseClient();

    // Verify the proposal exists
    const existing = await getProposalById(supabase, id);
    if (!existing) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Only proposals in reviewable states can be acted on.
    // Prevents re-approving an already-deployed proposal, etc.
    const reviewableStatuses: ProposalStatus[] = ['pending_review', 'edits_requested', 'draft'];
    if (!reviewableStatuses.includes(existing.status)) {
      return NextResponse.json(
        {
          error: `Proposal is "${existing.status}" and cannot be acted on. Only proposals in pending_review, edits_requested, or draft status can receive actions.`,
        },
        { status: 409 }
      );
    }

    // Record the action in the audit trail
    // TODO: Non-transactional — insertProposalAction and updateProposalStatus
    // are separate queries. Wrap in a Supabase RPC transaction when available.
    const actionId = await insertProposalAction(supabase, {
      proposal_id: id,
      action,
      decided_by: TEMP_OPERATOR_IDENTITY,
      reason: reason ?? undefined,
    });

    // Update the proposal status
    const updated = await updateProposalStatus(supabase, id, newStatus);

    logger.info('Proposal action processed', {
      proposalId: id,
      action,
      newStatus,
      actionId,
      operator: TEMP_OPERATOR_IDENTITY,
    });

    return NextResponse.json({
      success: true,
      actionId,
      proposal: updated,
    });
  } catch (err: unknown) {
    const message = extractErrorMessage(err);
    logger.error('Failed to process proposal action', {
      proposalId: id,
      action,
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Helpers ─────────────────────────────────────────────────────

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return 'Unknown error';
}
