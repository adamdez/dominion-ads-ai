import type { SupabaseClient } from '@supabase/supabase-js';
import type { RiskLevel } from '../types/recommendations';
import type { Market } from '../types/markets';
import { analyzeSearchTerms } from './search-term-analyzer';
import { queueRecommendation } from '../services/recommendations/recommendation-queue';
import { logger } from '../lib/logger';

/**
 * Core recommendation engine.
 *
 * Runs all analysis modules and queues their structured recommendations
 * into the operator approval queue. Each recommendation includes:
 * type, reason, expected_impact, risk_level, approval_required,
 * and related entities.
 *
 * Currently powered by:
 * - Search term analyzer (waste, opportunity, negatives, keywords, landing pages)
 *
 * Future modules:
 * - Budget anomaly detection
 * - Conversion anomaly detection
 * - Seller situation performance comparisons
 */
export async function generateRecommendations(
  supabase: SupabaseClient,
  market?: Market
): Promise<number[]> {
  logger.info('Recommendation generation started', { market });

  const ids: number[] = [];

  // --- Search term analysis ---
  const searchTermResult = await analyzeSearchTerms(supabase, market);

  for (const rec of searchTermResult.recommendations) {
    const id = await queueRecommendation(supabase, rec);
    ids.push(id);
  }

  logger.info('Recommendation generation completed', {
    total_queued: ids.length,
    market,
    sources: {
      search_term_analysis: searchTermResult.recommendations.length,
    },
    summary: {
      waste_terms: searchTermResult.waste_terms.length,
      opportunity_terms: searchTermResult.opportunity_terms.length,
      waste_spend: `$${(searchTermResult.total_waste_spend_micros / 1_000_000).toFixed(0)}`,
    },
  });

  return ids;
}

export function determineRiskLevel(type: string): RiskLevel {
  const greenTypes = [
    'alert', 'summary', 'anomaly_detection',
    'negative_keyword', 'negative_keyword_suggestion',
    'sync_health', 'waste_alert', 'high_cost_waste_term',
  ];
  const redTypes = [
    'new_campaign', 'geo_change',
    'major_budget_change', 'bidding_strategy_change',
  ];

  if (greenTypes.includes(type)) return 'green';
  if (redTypes.includes(type)) return 'red';
  return 'yellow';
}
