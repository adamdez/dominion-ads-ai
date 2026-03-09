import { config } from '../../lib/config';
import { logger } from '../../lib/logger';
import type {
  GoogleAdsCampaignRow,
  GoogleAdsAdGroupRow,
  GoogleAdsKeywordRow,
  GoogleAdsSearchTermRow,
  GoogleAdsMetricsRow,
} from './types';

/**
 * Google Ads API client — interface-first design.
 *
 * This client defines the methods the sync service needs.
 * The actual Google Ads API implementation will use the
 * google-ads-api npm package or direct REST calls.
 * Credentials are read from config (env vars).
 */
export interface IGoogleAdsClient {
  fetchCampaigns(): Promise<GoogleAdsCampaignRow[]>;
  fetchAdGroups(): Promise<GoogleAdsAdGroupRow[]>;
  fetchKeywords(): Promise<GoogleAdsKeywordRow[]>;
  fetchSearchTerms(startDate: string, endDate: string): Promise<GoogleAdsSearchTermRow[]>;
  fetchDailyMetrics(startDate: string, endDate: string): Promise<GoogleAdsMetricsRow[]>;
}

export class GoogleAdsClient implements IGoogleAdsClient {
  private customerId: string;

  constructor() {
    this.customerId = config.googleAds.customerId;

    if (!this.customerId) {
      logger.warn('Google Ads customer ID not configured');
    }
  }

  async fetchCampaigns(): Promise<GoogleAdsCampaignRow[]> {
    // TODO: implement with real Google Ads API call
    throw new Error('Google Ads API integration not yet implemented');
  }

  async fetchAdGroups(): Promise<GoogleAdsAdGroupRow[]> {
    throw new Error('Google Ads API integration not yet implemented');
  }

  async fetchKeywords(): Promise<GoogleAdsKeywordRow[]> {
    throw new Error('Google Ads API integration not yet implemented');
  }

  async fetchSearchTerms(_startDate: string, _endDate: string): Promise<GoogleAdsSearchTermRow[]> {
    throw new Error('Google Ads API integration not yet implemented');
  }

  async fetchDailyMetrics(_startDate: string, _endDate: string): Promise<GoogleAdsMetricsRow[]> {
    throw new Error('Google Ads API integration not yet implemented');
  }
}
