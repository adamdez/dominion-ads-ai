import type { SupabaseClient } from '@supabase/supabase-js';
import { insertApproval, insertImplementationLog } from '../../database/queries/approvals';
import { updateRecommendationStatus, getRecommendationById } from '../../database/queries/recommendations';
import { logger } from '../../lib/logger';
import type { ApprovalDecision } from '../../types/approvals';
import type { RecommendationStatus } from '../../types/recommendations';

const DECISION_TO_STATUS: Record<ApprovalDecision, RecommendationStatus> = {
  approved: 'approved',
  rejected: 'ignored',
  deferred: 'pending',
};

// TODO: Non-transactional — insertApproval() and updateRecommendationStatus()
// are separate queries. If the status update fails after the approval is inserted,
// the system is in an inconsistent state. Wrap in a Supabase RPC transaction
// (or a Postgres function) when available.
// TODO: No idempotency guard — calling recordApproval() twice for the same
// recommendation creates two approval rows. Consider checking current status
// before inserting (e.g. reject if already approved/ignored).
export async function recordApproval(
  supabase: SupabaseClient,
  recommendationId: number,
  decision: ApprovalDecision,
  decidedBy: string,
  reason?: string
) {
  const recommendation = await getRecommendationById(supabase, recommendationId);
  if (!recommendation) throw new Error(`Recommendation ${recommendationId} not found`);

  const approvalId = await insertApproval(supabase, {
    recommendation_id: recommendationId,
    decision,
    decided_by: decidedBy,
    reason: reason ?? null,
  });

  const newStatus = DECISION_TO_STATUS[decision];
  await updateRecommendationStatus(supabase, recommendationId, newStatus);

  logger.info('Approval recorded', {
    approvalId,
    recommendationId,
    decision,
    decidedBy,
    recommendationType: recommendation.recommendation_type,
  });

  return approvalId;
}

export async function logImplementation(
  supabase: SupabaseClient,
  data: {
    recommendationId: number;
    approvalId: number;
    actionTaken: string;
    result?: string;
    implementedBy: string;
    notes?: string;
  }
) {
  await insertImplementationLog(supabase, {
    recommendation_id: data.recommendationId,
    approval_id: data.approvalId,
    action_taken: data.actionTaken,
    result: data.result ?? null,
    implemented_by: data.implementedBy,
    notes: data.notes ?? null,
  });

  await updateRecommendationStatus(supabase, data.recommendationId, 'implemented');

  logger.info('Implementation logged', {
    recommendationId: data.recommendationId,
    action: data.actionTaken,
    implementedBy: data.implementedBy,
  });
}
