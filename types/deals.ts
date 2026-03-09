import type { Market } from './markets';

export type DealStage =
  | 'lead'
  | 'qualified'
  | 'appointment'
  | 'offer'
  | 'contract'
  | 'closed'
  | 'lost';

export const DEAL_STAGES: readonly DealStage[] = [
  'lead',
  'qualified',
  'appointment',
  'offer',
  'contract',
  'closed',
  'lost',
] as const;

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  appointment: 'Appointment',
  offer: 'Offer',
  contract: 'Contract',
  closed: 'Closed Deal',
  lost: 'Lost',
};

export interface Deal {
  id: number;
  lead_id: number;
  market: Market;
  stage: DealStage;
  property_address: string | null;
  offer_amount_cents: number | null;
  contract_amount_cents: number | null;
  assignment_fee_cents: number | null;
  revenue_cents: number | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealStageChange {
  id: number;
  deal_id: number;
  from_stage: DealStage | null;
  to_stage: DealStage;
  changed_by: string | null;
  notes: string | null;
  changed_at: string;
}
