export type ApprovalDecision = 'approved' | 'rejected' | 'deferred';

export interface Approval {
  id: number;
  recommendation_id: number;
  decision: ApprovalDecision;
  decided_by: string;
  reason: string | null;
  decided_at: string;
}

export interface ImplementationLog {
  id: number;
  recommendation_id: number | null;
  approval_id: number | null;
  action_taken: string;
  result: string | null;
  implemented_by: string;
  implemented_at: string;
  notes: string | null;
}

export interface SyncLog {
  id: number;
  sync_type: string;
  status: string;
  records_fetched: number;
  records_upserted: number;
  date_range_start: string | null;
  date_range_end: string | null;
  error_message: string | null;
  duration_ms: number | null;
  started_at: string;
  completed_at: string | null;
}
