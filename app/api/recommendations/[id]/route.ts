import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { recordApproval } from '@/services/approvals/approval-service';
import { updateRecommendationStatus, getRecommendationById } from '@/database/queries/recommendations';
import { logger } from '@/lib/logger';
import type { ApprovalDecision } from '@/types/approvals';
import type { RecommendationStatus } from '@/types/recommendations';

// Maps UI actions to the approval workflow.
// The UI sends 'approved' | 'testing' | 'ignored'.
// The approval service expects ApprovalDecision: 'approved' | 'rejected' | 'deferred'.
const ACTION_TO_DECISION: Record<string, ApprovalDecision> = {
  approved: 'approved',
  testing: 'approved', // "testing" is approved-with-intent — recorded as approval, then status overridden
  ignored: 'rejected', // "rejected" maps to "ignored" status via DECISION_TO_STATUS in approval-service
};

const VALID_ACTIONS = new Set(['approved', 'testing', 'ignored']);

// TODO: Replace with real auth. When auth is added, extract user identity from session.
const TEMP_OPERATOR_IDENTITY = 'operator';

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

    // Record the approval decision — this inserts into `approvals` table
    // and transitions the recommendation status via the approval service.
    const approvalReason =
      action === 'testing'
        ? reason ?? 'Approved for A/B testing'
        : reason ?? undefined;

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
      newStatus: updated.status,
      operator: TEMP_OPERATOR_IDENTITY,
    });

    return NextResponse.json({
      success: true,
      approvalId,
      recommendation: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Failed to process recommendation action', {
      recommendationId: id,
      action,
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
