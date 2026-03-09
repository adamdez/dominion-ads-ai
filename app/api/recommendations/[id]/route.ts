import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { recordApproval } from '@/services/approvals/approval-service';
import { updateRecommendationStatus, getRecommendationById } from '@/database/queries/recommendations';
import { logger } from '@/lib/logger';
import type { ApprovalDecision } from '@/types/approvals';
import type { RecommendationStatus } from '@/types/recommendations';

// ── Action → Decision mapping ────────────────────────────────────
// The UI sends 'approved' | 'testing' | 'ignored'.
// The approval service expects ApprovalDecision: 'approved' | 'rejected' | 'deferred'.
//
// "testing" maps to 'approved' because the operator *is* approving the recommendation
// — they just want it deployed as an A/B test rather than a full rollout.
// The intent is recorded via a structured reason prefix so downstream queries
// can distinguish test approvals from regular approvals.
const ACTION_TO_DECISION: Record<string, ApprovalDecision> = {
  approved: 'approved',
  testing: 'approved',
  ignored: 'rejected',
};

const VALID_ACTIONS = new Set(['approved', 'testing', 'ignored']);

// TODO: Replace with real auth. When auth is added, extract user identity
// from session/JWT. Currently every action is attributed to 'operator'.
const TEMP_OPERATOR_IDENTITY = 'operator';

// ── Structured reason prefix for test approvals ──────────────────
// Machine-readable prefix so audit queries can filter test approvals
// without fragile string matching on free-text reasons.
//
// Format: "[TEST] <human-readable reason>"
// Query pattern: WHERE reason LIKE '[TEST]%'
//
// TODO: When the approvals table supports a dedicated `intent` column
// (e.g. 'deploy' | 'test'), move this out of the reason string.
const TEST_REASON_PREFIX = '[TEST]';

function buildApprovalReason(
  action: string,
  operatorReason: string | undefined
): string | undefined {
  if (action === 'testing') {
    const base = operatorReason ?? 'Approved for A/B testing';
    return `${TEST_REASON_PREFIX} ${base}`;
  }
  return operatorReason ?? undefined;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid recommendation ID' }, { status: 400 });
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

  const decision = ACTION_TO_DECISION[action];

  try {
    const supabase = await createServerSupabaseClient();

    // Verify the recommendation exists before acting on it
    const rec = await getRecommendationById(supabase, id);
    if (!rec) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    // Build the approval reason with structured prefix for test actions.
    const approvalReason = buildApprovalReason(action, reason);

    // Record the approval decision — this inserts into `approvals` table
    // and transitions the recommendation status via the approval service.
    //
    // TODO: Non-transactional — recordApproval() and the subsequent
    // updateRecommendationStatus() are separate queries. If the second
    // fails, the approval row exists but the status is wrong. Wrap in
    // a Supabase RPC transaction when available.
    const approvalId = await recordApproval(
      supabase,
      id,
      decision,
      TEMP_OPERATOR_IDENTITY,
      approvalReason
    );

    // For "testing", override the status from "approved" → "testing".
    // recordApproval() sets status to "approved" (via DECISION_TO_STATUS),
    // but the operator specifically wants to run this as a test.
    if (action === 'testing') {
      await updateRecommendationStatus(supabase, id, 'testing' as RecommendationStatus);
    }

    // Fetch the updated recommendation to return current state
    const updated = await getRecommendationById(supabase, id);

    logger.info('Recommendation action processed', {
      recommendationId: id,
      action,
      decision,
      approvalId,
      intent: action === 'testing' ? 'test' : 'deploy',
      newStatus: updated.status,
      operator: TEMP_OPERATOR_IDENTITY,
    });

    return NextResponse.json({
      success: true,
      approvalId,
      recommendation: updated,
    });
  } catch (err: unknown) {
    // Supabase throws PostgrestError (plain object with `.message`), not Error instances.
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Unknown error';
    logger.error('Failed to process recommendation action', {
      recommendationId: id,
      action,
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
