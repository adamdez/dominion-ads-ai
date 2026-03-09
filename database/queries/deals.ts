import type { SupabaseClient } from '@supabase/supabase-js';
import type { Deal, DealStage, DealStageChange } from '../../types/deals';
import type { Market } from '../../types/markets';

export async function insertDeal(
  supabase: SupabaseClient,
  data: Omit<Deal, 'id' | 'created_at' | 'updated_at'>
) {
  const { data: deal, error } = await supabase
    .from('deals')
    .insert(data)
    .select('id')
    .single();
  if (error) throw error;
  return deal.id as number;
}

export async function updateDealStage(
  supabase: SupabaseClient,
  dealId: number,
  newStage: DealStage,
  changedBy: string,
  notes?: string
) {
  const { data: current, error: fetchError } = await supabase
    .from('deals')
    .select('stage')
    .eq('id', dealId)
    .single();
  if (fetchError) throw fetchError;

  const { error: updateError } = await supabase
    .from('deals')
    .update({ stage: newStage, updated_at: new Date().toISOString() })
    .eq('id', dealId);
  if (updateError) throw updateError;

  const { error: historyError } = await supabase.from('deal_stage_history').insert({
    deal_id: dealId,
    from_stage: current.stage,
    to_stage: newStage,
    changed_by: changedBy,
    notes,
  });
  if (historyError) throw historyError;
}

export async function getDealsByMarket(supabase: SupabaseClient, market: Market) {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('market', market)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as Deal[];
}

export async function getDealStageHistory(supabase: SupabaseClient, dealId: number) {
  const { data, error } = await supabase
    .from('deal_stage_history')
    .select('*')
    .eq('deal_id', dealId)
    .order('changed_at', { ascending: true });
  if (error) throw error;
  return data as DealStageChange[];
}
