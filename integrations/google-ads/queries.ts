/**
 * GAQL query templates for Google Ads API.
 * These will be used by the client to fetch data.
 * Exact field names follow the Google Ads API resource reference.
 */

export const CAMPAIGN_QUERY = `
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.advertising_channel_type
  FROM campaign
  WHERE campaign.status != 'REMOVED'
`;

export const AD_GROUP_QUERY = `
  SELECT
    ad_group.id,
    ad_group.name,
    ad_group.status,
    ad_group.campaign
  FROM ad_group
  WHERE ad_group.status != 'REMOVED'
`;

export const KEYWORD_QUERY = `
  SELECT
    ad_group_criterion.criterion_id,
    ad_group_criterion.keyword.text,
    ad_group_criterion.keyword.match_type,
    ad_group_criterion.status,
    ad_group_criterion.ad_group
  FROM ad_group_criterion
  WHERE ad_group_criterion.type = 'KEYWORD'
    AND ad_group_criterion.status != 'REMOVED'
`;

export function searchTermQuery(startDate: string, endDate: string): string {
  return `
    SELECT
      search_term_view.search_term,
      campaign.id,
      ad_group.id,
      segments.keyword.info.text,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM search_term_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
  `;
}

export function dailyMetricsQuery(startDate: string, endDate: string): string {
  return `
    SELECT
      segments.date,
      campaign.id,
      ad_group.id,
      ad_group_criterion.criterion_id,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM keyword_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
  `;
}
