import type { Market } from './markets';
import type { SellerSituation } from './seller-situations';

export interface Campaign {
  id: number;
  google_campaign_id: string;
  name: string;
  market: Market;
  status: string;
  campaign_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdGroup {
  id: number;
  google_ad_group_id: string;
  campaign_id: number;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Keyword {
  id: number;
  google_keyword_id: string;
  ad_group_id: number;
  text: string;
  match_type: string;
  status: string;
  seller_situation: SellerSituation | null;
  created_at: string;
  updated_at: string;
}

export interface SearchTerm {
  id: number;
  search_term: string;
  campaign_id: number | null;
  ad_group_id: number | null;
  keyword_id: number | null;
  market: Market | null;
  seller_situation: SellerSituation | null;
  intent_label: string | null;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  conversion_value_micros: number;
  is_waste: boolean;
  is_opportunity: boolean;
  first_seen_at: string;
  last_seen_at: string;
}

export interface DailyMetrics {
  id: number;
  report_date: string;
  campaign_id: number | null;
  ad_group_id: number | null;
  keyword_id: number | null;
  market: Market | null;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  conversion_value_micros: number;
  created_at: string;
}
