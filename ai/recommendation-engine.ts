import type { SupabaseClient } from '@supabase/supabase-js';
import type { Recommendation, RiskLevel } from '../types/recommendations';
import type { Market } from '../types/markets';
import { queueRecommendation } from '../services/recommendations/recommendation-queue';
import { logger } from '../lib/logger';

type NewRecommendation = Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>;

/**
 * Core recommendation engine.
 *
 * Reads stored ads data, lead data, and deal data to generate
 * structured, explainable recommendations for the operator dashboard.
 *
 * Each recommendation includes:
 * - type (what kind of action)
 * - reason (why this matters)
 * - expected_impact (what we think will happen)
 * - risk_level (green / yellow / red)
 * - approval_required (boolean)
 * - related entities (campaign, ad group, keyword, search term, market)
 */
export async function generateRecommendations(
  supabase: SupabaseClient,
  market?: Market
): Promise<number[]> {
  logger.info('Recommendation generation started', { market });

  // TODO: implement recommendation generation
  // Sources of recommendations:
  // 1. Search term waste (high cost, zero conversions)
  // 2. Search term opportunity (converting terms not added as keywords)
  // 3. Budget anomalies (spend spikes or drops)
  // 4. Conversion anomalies (sudden changes)
  // 5. Landing page mismatches
  // 6. Seller situation performance gaps
  // 7. Market-specific opportunities

  const recommendations: NewRecommendation[] = [];

  const ids: number[] = [];
  for (const rec of recommendations) {
    const id = await queueRecommendation(supabase, rec);
    ids.push(id);
  }

  logger.info('Recommendation generation completed', { count: ids.length, market });
  return ids;
}

export function determineRiskLevel(type: string): RiskLevel {
  const greenTypes = ['alert', 'summary', 'anomaly_detection', 'negative_keyword_suggestion', 'sync_health'];
  const redTypes = ['new_campaign', 'geo_change', 'major_budget_change', 'bidding_strategy_change'];

  if (greenTypes.includes(type)) return 'green';
  if (redTypes.includes(type)) return 'red';
  return 'yellow';
}
