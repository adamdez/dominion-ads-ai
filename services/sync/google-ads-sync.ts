import type { SupabaseClient } from '@supabase/supabase-js';
import type { IGoogleAdsClient } from '../../integrations/google-ads/client';
import { logger } from '../../lib/logger';
import { upsertCampaign, upsertAdGroup, upsertKeyword } from '../../database/queries/campaigns';
import { upsertSearchTerm } from '../../database/queries/search-terms';
import type { Market } from '../../types/markets';

interface SyncOptions {
  startDate: string;
  endDate: string;
  campaignMarketMap: Record<string, Market>;
}

/**
 * Orchestrates a full Google Ads data sync.
 * Idempotent: re-running the same date range upserts cleanly.
 */
export async function runGoogleAdsSync(
  supabase: SupabaseClient,
  adsClient: IGoogleAdsClient,
  options: SyncOptions
) {
  const startTime = Date.now();
  logger.info('Google Ads sync started', { startDate: options.startDate, endDate: options.endDate });

  const result = { campaigns: 0, ad_groups: 0, keywords: 0, search_terms: 0, daily_metrics: 0 };

  try {
    const campaigns = await adsClient.fetchCampaigns();
    for (const c of campaigns) {
      const market = options.campaignMarketMap[c.campaign_id] ?? 'spokane';
      await upsertCampaign(supabase, {
        google_campaign_id: c.campaign_id,
        name: c.campaign_name,
        market,
        status: c.campaign_status,
        campaign_type: c.campaign_type,
      });
      result.campaigns++;
    }

    const adGroups = await adsClient.fetchAdGroups();
    for (const ag of adGroups) {
      const campaignRow = campaigns.find((c) => c.campaign_id === ag.campaign_id);
      if (!campaignRow) continue;
      await upsertAdGroup(supabase, {
        google_ad_group_id: ag.ad_group_id,
        campaign_id: Number(ag.campaign_id),
        name: ag.ad_group_name,
        status: ag.ad_group_status,
      });
      result.ad_groups++;
    }

    const keywords = await adsClient.fetchKeywords();
    for (const kw of keywords) {
      await upsertKeyword(supabase, {
        google_keyword_id: kw.keyword_id,
        ad_group_id: Number(kw.ad_group_id),
        text: kw.keyword_text,
        match_type: kw.match_type,
        status: kw.keyword_status,
        seller_situation: null,
      });
      result.keywords++;
    }

    const searchTerms = await adsClient.fetchSearchTerms(options.startDate, options.endDate);
    for (const st of searchTerms) {
      await upsertSearchTerm(supabase, {
        search_term: st.search_term,
        campaign_id: Number(st.campaign_id),
        ad_group_id: Number(st.ad_group_id),
        keyword_id: Number(st.keyword_id),
        market: options.campaignMarketMap[st.campaign_id] ?? null,
      });
      result.search_terms++;
    }

    const durationMs = Date.now() - startTime;
    logger.info('Google Ads sync completed', { ...result, durationMs });
    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error('Google Ads sync failed', { error: String(error), durationMs });
    throw error;
  }
}
