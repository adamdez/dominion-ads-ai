import type { Market } from './markets';
import type { SellerSituation } from './seller-situations';
import type { DealStage } from './deals';

export interface Lead {
  id: number;
  external_id: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  property_address: string | null;
  property_city: string | null;
  property_state: string | null;
  property_zip: string | null;
  market: Market | null;
  seller_situation: SellerSituation;
  motivation_score: number | null;
  urgency_score: number | null;
  lead_score: number | null;
  deal_probability: number | null;
  stage: DealStage;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadAttribution {
  id: number;
  lead_id: number;
  gclid: string | null;
  campaign_id: number | null;
  ad_group_id: number | null;
  keyword_id: number | null;
  search_term_id: number | null;
  landing_page: string | null;
  landing_domain: string | null;
  source_channel: string;
  market: Market | null;
  created_at: string;
}
