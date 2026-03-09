import type { SupabaseClient } from '@supabase/supabase-js';
import type { Recommendation, RecommendationStatus, RiskLevel } from '../../types/recommendations';
import type { Market } from '../../types/markets';

export async function insertRecommendation(
  supabase: SupabaseClient,
  data: Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>
) {
  const { data: rec, error } = await supabase
    .from('recommendations')
    .insert(data)
    .select('id')
    .single();
  if (error) throw error;
  return rec.id as number;
}

export async function updateRecommendationStatus(
  supabase: SupabaseClient,
  id: number,
  status: RecommendationStatus
) {
  const { error } = await supabase
    .from('recommendations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function getPendingRecommendations(
  supabase: SupabaseClient,
  filters?: { market?: Market; risk_level?: RiskLevel }
) {
  let query = supabase
    .from('recommendations')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (filters?.market) {
    query = query.eq('market', filters.market);
  }
  if (filters?.risk_level) {
    query = query.eq('risk_level', filters.risk_level);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Recommendation[];
}

export async function getRecommendationById(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Recommendation;
}
