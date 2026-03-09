import type { SupabaseClient } from '@supabase/supabase-js';
import {
  insertRecommendation,
  updateRecommendationStatus,
  getPendingRecommendations,
} from '../../database/queries/recommendations';
import { logger } from '../../lib/logger';
import type { Recommendation, RecommendationStatus } from '../../types/recommendations';
import type { Market } from '../../types/markets';
import type { RiskLevel } from '../../types/recommendations';

type NewRecommendation = Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>;

export async function queueRecommendation(
  supabase: SupabaseClient,
  rec: NewRecommendation
): Promise<number> {
  const id = await insertRecommendation(supabase, rec);
  logger.info('Recommendation queued', {
    id,
    type: rec.recommendation_type,
    risk: rec.risk_level,
    market: rec.market,
  });
  return id;
}

export async function transitionRecommendation(
  supabase: SupabaseClient,
  id: number,
  newStatus: RecommendationStatus
) {
  await updateRecommendationStatus(supabase, id, newStatus);
  logger.info('Recommendation status changed', { id, newStatus });
}

export async function fetchPendingQueue(
  supabase: SupabaseClient,
  filters?: { market?: Market; risk_level?: RiskLevel }
) {
  return getPendingRecommendations(supabase, filters);
}
