import type { Market } from './markets';
import type { SellerSituation } from './seller-situations';

export type RiskLevel = 'green' | 'yellow' | 'red';

export type RecommendationStatus =
  | 'pending'
  | 'approved'
  | 'testing'
  | 'ignored'
  | 'implemented'
  | 'expired';

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  green: 'Low Risk',
  yellow: 'Moderate Risk',
  red: 'High Risk',
};

export interface Recommendation {
  id: number;
  recommendation_type: string;
  reason: string;
  expected_impact: string | null;
  risk_level: RiskLevel;
  approval_required: boolean;
  status: RecommendationStatus;
  market: Market | null;
  seller_situation: SellerSituation | null;
  related_campaign_id: number | null;
  related_ad_group_id: number | null;
  related_keyword_id: number | null;
  related_search_term_id: number | null;
  related_lead_id: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
