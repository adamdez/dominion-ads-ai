/**
 * Google Ads REST API client.
 *
 * Uses the Google Ads API v23 REST endpoint (searchStream) instead of
 * gRPC to avoid native-module dependencies that break in serverless
 * environments.  All data access is READ-ONLY.
 *
 * Credentials are pulled from lib/config (env vars).
 *
 * Architecture:
 *   1. getAccessToken() handles OAuth refresh + caching
 *   2. executeGaql() sends a GAQL query to the searchStream endpoint
 *   3. Each fetch* method runs a GAQL query and maps the camelCase
 *      REST response to the snake_case row types the sync service expects
 */

import { config } from '../../lib/config';
import { logger } from '../../lib/logger';
import { getAccessToken, clearCachedToken } from './auth';
import {
  CAMPAIGN_QUERY,
  AD_GROUP_QUERY,
  KEYWORD_QUERY,
  searchTermQuery,
  dailyMetricsQuery,
} from './queries';
import type {
  GoogleAdsCampaignRow,
  GoogleAdsAdGroupRow,
  GoogleAdsKeywordRow,
  GoogleAdsSearchTermRow,
  GoogleAdsMetricsRow,
} from './types';

// ── Constants ───────────────────────────────────────────────────

const API_VERSION = 'v23';

/** Strip dashes from customer IDs — the API requires bare digits. */
function stripDashes(id: string): string {
  return id.replace(/-/g, '');
}

// ── Interface ───────────────────────────────────────────────────

export interface IGoogleAdsClient {
  fetchCampaigns(): Promise<GoogleAdsCampaignRow[]>;
  fetchAdGroups(): Promise<GoogleAdsAdGroupRow[]>;
  fetchKeywords(): Promise<GoogleAdsKeywordRow[]>;
  fetchSearchTerms(startDate: string, endDate: string): Promise<GoogleAdsSearchTermRow[]>;
  fetchDailyMetrics(startDate: string, endDate: string): Promise<GoogleAdsMetricsRow[]>;
}

// ── REST response types ─────────────────────────────────────────
// These mirror the camelCase JSON the API returns.
// Only the fields we SELECT are present; others are omitted by the API.

export interface GaqlResultRow {
  campaign?: {
    id?: string;
    name?: string;
    status?: string;
    advertisingChannelType?: string;
  };
  adGroup?: {
    id?: string;
    name?: string;
    status?: string;
  };
  adGroupCriterion?: {
    criterionId?: string;
    keyword?: {
      text?: string;
      matchType?: string;
    };
    status?: string;
  };
  searchTermView?: {
    searchTerm?: string;
  };
  metrics?: {
    impressions?: string;   // int64 → string in JSON
    clicks?: string;        // int64 → string
    costMicros?: string;    // int64 → string
    conversions?: number;   // double → number
    conversionsValue?: number; // double → number
  };
  segments?: {
    date?: string;
    keyword?: {
      /** Resource name: "customers/{id}/adGroupCriteria/{adGroupId}~{criterionId}" */
      adGroupCriterion?: string;
    };
  };
}

interface SearchStreamBatch {
  results?: GaqlResultRow[];
  fieldMask?: string;
  requestId?: string;
}

// ── Core API caller ─────────────────────────────────────────────

/**
 * Execute a GAQL query via the Google Ads REST searchStream endpoint.
 * Returns all result rows across all batches.
 *
 * Automatically retries once on 401 (expired token).
 */
export async function executeGaql(query: string, retried = false): Promise<GaqlResultRow[]> {
  const customerId = stripDashes(config.googleAds.customerId);
  const loginCustomerId = stripDashes(config.googleAds.loginCustomerId);
  const developerToken = config.googleAds.developerToken;

  if (!customerId) {
    throw new Error('GOOGLE_ADS_CUSTOMER_ID is not set');
  }
  if (!developerToken) {
    throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN is not set');
  }

  const accessToken = await getAccessToken();

  const url = `https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/googleAds:searchStream`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
  };

  // login-customer-id is required when accessing via an MCC manager account
  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });

  // Handle 401 — token may have expired mid-sync
  if (response.status === 401 && !retried) {
    logger.warn('Google Ads API returned 401 — refreshing token and retrying');
    clearCachedToken();
    return executeGaql(query, true);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Google Ads API error (HTTP ${response.status}): ${errorBody}`
    );
  }

  // searchStream returns a JSON array of batch objects
  const batches = (await response.json()) as SearchStreamBatch[];

  const allRows: GaqlResultRow[] = [];
  for (const batch of batches) {
    if (batch.results) {
      allRows.push(...batch.results);
    }
  }

  return allRows;
}

// ── Helpers for safe numeric parsing ────────────────────────────

/** Parse an int64 string from the API, defaulting to 0. */
function int(val: string | undefined): number {
  if (!val) return 0;
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

/** Parse a double from the API, defaulting to 0. */
function dbl(val: number | undefined): number {
  return val ?? 0;
}

/**
 * Convert a currency-unit double (e.g. 150.50) to micros (150_500_000).
 * The Google Ads API returns conversions_value in the account currency;
 * our database stores it in micros for integer-safe arithmetic.
 */
function toMicros(val: number | undefined): number {
  return Math.round(dbl(val) * 1_000_000);
}

/**
 * Extract the criterion ID from an adGroupCriterion resource name.
 * Format: "customers/{customerId}/adGroupCriteria/{adGroupId}~{criterionId}"
 * Returns empty string if parsing fails.
 */
function parseCriterionIdFromResourceName(resourceName: string | undefined): string {
  if (!resourceName) return '';
  // Last path segment is "{adGroupId}~{criterionId}"
  const lastSlash = resourceName.lastIndexOf('/');
  if (lastSlash === -1) return '';
  const segment = resourceName.slice(lastSlash + 1);
  const tildeIndex = segment.indexOf('~');
  if (tildeIndex === -1) return '';
  return segment.slice(tildeIndex + 1);
}

// ── Client implementation ───────────────────────────────────────

export class GoogleAdsClient implements IGoogleAdsClient {
  private customerId: string;

  constructor() {
    this.customerId = config.googleAds.customerId;

    if (!this.customerId) {
      logger.warn('Google Ads customer ID not configured');
    }
  }

  async fetchCampaigns(): Promise<GoogleAdsCampaignRow[]> {
    logger.info('Fetching campaigns from Google Ads API');
    const rows = await executeGaql(CAMPAIGN_QUERY);

    return rows.map((r) => ({
      campaign_id: r.campaign?.id ?? '',
      campaign_name: r.campaign?.name ?? '',
      campaign_status: r.campaign?.status ?? 'UNKNOWN',
      campaign_type: r.campaign?.advertisingChannelType ?? 'UNKNOWN',
    }));
  }

  async fetchAdGroups(): Promise<GoogleAdsAdGroupRow[]> {
    logger.info('Fetching ad groups from Google Ads API');
    const rows = await executeGaql(AD_GROUP_QUERY);

    return rows.map((r) => ({
      ad_group_id: r.adGroup?.id ?? '',
      ad_group_name: r.adGroup?.name ?? '',
      ad_group_status: r.adGroup?.status ?? 'UNKNOWN',
      campaign_id: r.campaign?.id ?? '',
    }));
  }

  async fetchKeywords(): Promise<GoogleAdsKeywordRow[]> {
    logger.info('Fetching keywords from Google Ads API');
    const rows = await executeGaql(KEYWORD_QUERY);

    return rows.map((r) => ({
      keyword_id: r.adGroupCriterion?.criterionId ?? '',
      keyword_text: r.adGroupCriterion?.keyword?.text ?? '',
      match_type: r.adGroupCriterion?.keyword?.matchType ?? 'UNKNOWN',
      keyword_status: r.adGroupCriterion?.status ?? 'UNKNOWN',
      ad_group_id: r.adGroup?.id ?? '',
    }));
  }

  async fetchSearchTerms(
    startDate: string,
    endDate: string
  ): Promise<GoogleAdsSearchTermRow[]> {
    logger.info('Fetching search terms from Google Ads API', {
      startDate,
      endDate,
    });
    const query = searchTermQuery(startDate, endDate);
    const rows = await executeGaql(query);

    return rows.map((r) => ({
      search_term: r.searchTermView?.searchTerm ?? '',
      campaign_id: r.campaign?.id ?? '',
      ad_group_id: r.adGroup?.id ?? '',
      // keyword criterion ID is extracted from the segment resource name
      // since ad_group_criterion fields can't be selected from search_term_view
      keyword_id: parseCriterionIdFromResourceName(
        r.segments?.keyword?.adGroupCriterion
      ),
      impressions: int(r.metrics?.impressions),
      clicks: int(r.metrics?.clicks),
      cost_micros: int(r.metrics?.costMicros),
      conversions: dbl(r.metrics?.conversions),
      conversion_value_micros: toMicros(r.metrics?.conversionsValue),
    }));
  }

  async fetchDailyMetrics(
    startDate: string,
    endDate: string
  ): Promise<GoogleAdsMetricsRow[]> {
    logger.info('Fetching daily metrics from Google Ads API', {
      startDate,
      endDate,
    });
    const query = dailyMetricsQuery(startDate, endDate);
    const rows = await executeGaql(query);

    return rows.map((r) => ({
      date: r.segments?.date ?? '',
      campaign_id: r.campaign?.id ?? '',
      ad_group_id: r.adGroup?.id ?? '',
      keyword_id: r.adGroupCriterion?.criterionId ?? '',
      impressions: int(r.metrics?.impressions),
      clicks: int(r.metrics?.clicks),
      cost_micros: int(r.metrics?.costMicros),
      conversions: dbl(r.metrics?.conversions),
      conversion_value_micros: toMicros(r.metrics?.conversionsValue),
    }));
  }
}
