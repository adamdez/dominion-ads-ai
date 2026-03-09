/**
 * GAQL query templates for the Google Ads REST API (v23).
 *
 * Field names follow the Google Ads API resource reference.
 * Important: the REST API returns camelCase JSON keys, so the client
 * must map them to our snake_case row types.
 *
 * All queries select explicit IDs (campaign.id, ad_group.id) instead
 * of resource-name references (ad_group.campaign) to simplify parsing.
 */

// ── Structural queries (no date range) ──────────────────────────

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
    campaign.id
  FROM ad_group
  WHERE ad_group.status != 'REMOVED'
`;

export const KEYWORD_QUERY = `
  SELECT
    ad_group_criterion.criterion_id,
    ad_group_criterion.keyword.text,
    ad_group_criterion.keyword.match_type,
    ad_group_criterion.status,
    ad_group.id,
    campaign.id
  FROM ad_group_criterion
  WHERE ad_group_criterion.type = 'KEYWORD'
    AND ad_group_criterion.status != 'REMOVED'
`;

// ── Date-ranged queries ─────────────────────────────────────────

export function searchTermQuery(startDate: string, endDate: string): string {
  // NOTE: ad_group_criterion fields are NOT selectable from search_term_view.
  // The keyword_id link is resolved via segments.keyword.ad_group_criterion
  // resource name parsing in the client mapper.
  return `
    SELECT
      search_term_view.search_term,
      campaign.id,
      ad_group.id,
      segments.keyword.ad_group_criterion,
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
