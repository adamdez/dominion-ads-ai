import type { SupabaseClient } from '@supabase/supabase-js';
import type { DailyMetrics } from '../../types/ads';
import type { Market } from '../../types/markets';

export async function upsertDailyMetrics(
  supabase: SupabaseClient,
  data: Omit<DailyMetrics, 'id' | 'created_at'>
) {
  const { error } = await supabase
    .from('daily_metrics')
    .upsert(data, { onConflict: 'report_date,campaign_id,ad_group_id,keyword_id' });
  if (error) throw error;
}

export async function getDailyMetricsByDateRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string,
  filters?: { market?: Market; campaign_id?: number }
) {
  let query = supabase
    .from('daily_metrics')
    .select('*')
    .gte('report_date', startDate)
    .lte('report_date', endDate)
    .order('report_date', { ascending: false });

  if (filters?.market) {
    query = query.eq('market', filters.market);
  }
  if (filters?.campaign_id) {
    query = query.eq('campaign_id', filters.campaign_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as DailyMetrics[];
}
