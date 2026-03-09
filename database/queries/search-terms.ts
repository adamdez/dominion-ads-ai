import type { SupabaseClient } from '@supabase/supabase-js';
import type { SearchTerm } from '../../types/ads';
import type { Market } from '../../types/markets';

export async function upsertSearchTerm(
  supabase: SupabaseClient,
  data: Pick<SearchTerm, 'search_term' | 'campaign_id' | 'ad_group_id' | 'keyword_id' | 'market'>
) {
  const { error } = await supabase
    .from('search_terms')
    .upsert(
      { ...data, last_seen_at: new Date().toISOString() },
      { onConflict: 'search_term,campaign_id,ad_group_id' }
    );
  if (error) throw error;
}

export async function getWasteTerms(supabase: SupabaseClient, market?: Market) {
  let query = supabase
    .from('search_terms')
    .select('*')
    .eq('is_waste', true)
    .order('last_seen_at', { ascending: false });

  if (market) {
    query = query.eq('market', market);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SearchTerm[];
}

export async function getOpportunityTerms(supabase: SupabaseClient, market?: Market) {
  let query = supabase
    .from('search_terms')
    .select('*')
    .eq('is_opportunity', true)
    .order('last_seen_at', { ascending: false });

  if (market) {
    query = query.eq('market', market);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SearchTerm[];
}

export async function flagSearchTermAsWaste(supabase: SupabaseClient, id: number) {
  const { error } = await supabase
    .from('search_terms')
    .update({ is_waste: true })
    .eq('id', id);
  if (error) throw error;
}

export async function flagSearchTermAsOpportunity(supabase: SupabaseClient, id: number) {
  const { error } = await supabase
    .from('search_terms')
    .update({ is_opportunity: true })
    .eq('id', id);
  if (error) throw error;
}
