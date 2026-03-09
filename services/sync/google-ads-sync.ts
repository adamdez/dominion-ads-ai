import type { SupabaseClient } from '@supabase/supabase-js';
import type { IGoogleAdsClient } from '../../integrations/google-ads/client';
import type { GoogleAdsSyncResult } from '../../integrations/google-ads/types';
import { logger } from '../../lib/logger';
import { upsertCampaign, upsertAdGroup, upsertKeyword } from '../../database/queries/campaigns';
import { upsertSearchTerm } from '../../database/queries/search-terms';
import { upsertDailyMetrics } from '../../database/queries/daily-metrics';
import type { Market } from '../../types/markets';

interface SyncOptions {
  startDate: string;
  endDate: string;
  /** Maps Google Ads campaign IDs to their market. */
  campaignMarketMap: Record<string, Market>;
}

/**
 * Orchestrates a full Google Ads data sync.
 *
 * The key constraint: every FK column in the database uses internal
 * auto-generated IDs, not Google Ads IDs. This sync resolves the mapping
 * at each stage:
 *
 *   1. Upsert campaigns        → build googleCampaignId → internalId map
 *   2. Upsert ad groups         → use campaign map, build ad group map
 *   3. Upsert keywords          → use ad group map, build keyword map
 *   4. Upsert search terms      → use all three maps
 *   5. Upsert daily metrics     → use all three maps
 *
 * Idempotent: re-running the same date range upserts cleanly via
 * ON CONFLICT on the relevant unique columns.
 */
export async function runGoogleAdsSync(
  supabase: SupabaseClient,
  adsClient: IGoogleAdsClient,
  options: SyncOptions
): Promise<GoogleAdsSyncResult> {
  const startTime = Date.now();
  logger.info('Google Ads sync started', {
    startDate: options.startDate,
    endDate: options.endDate,
  });

  const result: GoogleAdsSyncResult = {
    campaigns: 0,
    ad_groups: 0,
    keywords: 0,
    search_terms: 0,
    daily_metrics: 0,
  };

  try {
    // ------------------------------------------------------------------
    // Stage 1: Campaigns
    // ------------------------------------------------------------------
    const campaignIdMap = new Map<string, number>();
    const campaignMarketResolved = new Map<string, Market>();

    const campaigns = await adsClient.fetchCampaigns();
    for (const c of campaigns) {
      const market = options.campaignMarketMap[c.campaign_id] ?? 'spokane';
      const internalId = await upsertCampaign(supabase, {
        google_campaign_id: c.campaign_id,
        name: c.campaign_name,
        market,
        status: c.campaign_status,
        campaign_type: c.campaign_type,
      });
      campaignIdMap.set(c.campaign_id, internalId);
      campaignMarketResolved.set(c.campaign_id, market);
      result.campaigns++;
    }

    logger.info('Campaigns synced', { count: result.campaigns });

    // ------------------------------------------------------------------
    // Stage 2: Ad Groups
    // ------------------------------------------------------------------
    const adGroupIdMap = new Map<string, number>();

    const adGroups = await adsClient.fetchAdGroups();
    for (const ag of adGroups) {
      const internalCampaignId = campaignIdMap.get(ag.campaign_id);
      if (internalCampaignId === undefined) {
        logger.warn('Ad group references unknown campaign, skipping', {
          google_ad_group_id: ag.ad_group_id,
          google_campaign_id: ag.campaign_id,
        });
        continue;
      }

      const internalId = await upsertAdGroup(supabase, {
        google_ad_group_id: ag.ad_group_id,
        campaign_id: internalCampaignId,
        name: ag.ad_group_name,
        status: ag.ad_group_status,
      });
      adGroupIdMap.set(ag.ad_group_id, internalId);
      result.ad_groups++;
    }

    logger.info('Ad groups synced', { count: result.ad_groups });

    // ------------------------------------------------------------------
    // Stage 3: Keywords
    // ------------------------------------------------------------------
    const keywordIdMap = new Map<string, number>();

    const keywords = await adsClient.fetchKeywords();
    for (const kw of keywords) {
      const internalAdGroupId = adGroupIdMap.get(kw.ad_group_id);
      if (internalAdGroupId === undefined) {
        logger.warn('Keyword references unknown ad group, skipping', {
          google_keyword_id: kw.keyword_id,
          google_ad_group_id: kw.ad_group_id,
        });
        continue;
      }

      const internalId = await upsertKeyword(supabase, {
        google_keyword_id: kw.keyword_id,
        ad_group_id: internalAdGroupId,
        text: kw.keyword_text,
        match_type: kw.match_type,
        status: kw.keyword_status,
        seller_situation: null,
      });
      keywordIdMap.set(kw.keyword_id, internalId);
      result.keywords++;
    }

    logger.info('Keywords synced', { count: result.keywords });

    // ------------------------------------------------------------------
    // Stage 4: Search Terms
    // Metrics are upserted (last-write-wins on the unique constraint).
    // The search_terms table holds the latest synced snapshot, not
    // cumulative history. Daily breakdowns live in daily_metrics.
    // ------------------------------------------------------------------
    const searchTerms = await adsClient.fetchSearchTerms(
      options.startDate,
      options.endDate
    );
    for (const st of searchTerms) {
      const internalCampaignId = campaignIdMap.get(st.campaign_id) ?? null;
      const internalAdGroupId = adGroupIdMap.get(st.ad_group_id) ?? null;
      const internalKeywordId = keywordIdMap.get(st.keyword_id) ?? null;
      const market = campaignMarketResolved.get(st.campaign_id) ?? null;

      await upsertSearchTerm(supabase, {
        search_term: st.search_term,
        campaign_id: internalCampaignId,
        ad_group_id: internalAdGroupId,
        keyword_id: internalKeywordId,
        market,
        impressions: st.impressions,
        clicks: st.clicks,
        cost_micros: st.cost_micros,
        conversions: st.conversions,
        conversion_value_micros: st.conversion_value_micros,
      });
      result.search_terms++;
    }

    logger.info('Search terms synced', { count: result.search_terms });

    // ------------------------------------------------------------------
    // Stage 5: Daily Metrics
    // ------------------------------------------------------------------
    const metricsRows = await adsClient.fetchDailyMetrics(
      options.startDate,
      options.endDate
    );
    for (const m of metricsRows) {
      const internalCampaignId = campaignIdMap.get(m.campaign_id) ?? null;
      const internalAdGroupId = adGroupIdMap.get(m.ad_group_id) ?? null;
      const internalKeywordId = keywordIdMap.get(m.keyword_id) ?? null;
      const market = campaignMarketResolved.get(m.campaign_id) ?? null;

      await upsertDailyMetrics(supabase, {
        report_date: m.date,
        campaign_id: internalCampaignId,
        ad_group_id: internalAdGroupId,
        keyword_id: internalKeywordId,
        market,
        impressions: m.impressions,
        clicks: m.clicks,
        cost_micros: m.cost_micros,
        conversions: m.conversions,
        conversion_value_micros: m.conversion_value_micros,
      });
      result.daily_metrics++;
    }

    logger.info('Daily metrics synced', { count: result.daily_metrics });

    // ------------------------------------------------------------------
    // Done
    // ------------------------------------------------------------------
    const durationMs = Date.now() - startTime;
    logger.info('Google Ads sync completed', { ...result, durationMs });
    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error('Google Ads sync failed', {
      error: String(error),
      durationMs,
      progress: result,
    });
    throw error;
  }
}
