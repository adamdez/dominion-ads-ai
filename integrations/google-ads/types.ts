/**
 * Google Ads API response types.
 * Interface-first: these define the shape we expect from the API.
 * Real field mappings will be confirmed against official Google Ads API docs.
 */

export interface GoogleAdsCampaignRow {
  campaign_id: string;
  campaign_name: string;
  campaign_status: string;
  campaign_type: string;
}

export interface GoogleAdsAdGroupRow {
  ad_group_id: string;
  ad_group_name: string;
  ad_group_status: string;
  campaign_id: string;
}

export interface GoogleAdsKeywordRow {
  keyword_id: string;
  keyword_text: string;
  match_type: string;
  keyword_status: string;
  ad_group_id: string;
}

export interface GoogleAdsSearchTermRow {
  search_term: string;
  campaign_id: string;
  ad_group_id: string;
  keyword_id: string;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  conversion_value_micros: number;
}

export interface GoogleAdsMetricsRow {
  date: string;
  campaign_id: string;
  ad_group_id: string;
  keyword_id: string;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  conversion_value_micros: number;
}

export interface GoogleAdsSyncResult {
  campaigns: number;
  ad_groups: number;
  keywords: number;
  search_terms: number;
  daily_metrics: number;
}
