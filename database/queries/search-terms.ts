import type { SupabaseClient } from '@supabase/supabase-js';
import type { SearchTerm } from '../../types/ads';
import type { Market } from '../../types/markets';
import type { SellerSituation } from '../../types/seller-situations';

// ---------------------------------------------------------------------------
// Upsert
// ---------------------------------------------------------------------------

export interface SearchTermUpsertData {
  search_term: string;
  campaign_id: number | null;
  ad_group_id: number | null;
  keyword_id: number | null;
  market: Market | null;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  conversion_value_micros: number;
}

export async function upsertSearchTerm(
  supabase: SupabaseClient,
  data: SearchTermUpsertData
) {
  const { error } = await supabase
    .from('search_terms')
    .upsert(
      { ...data, last_seen_at: new Date().toISOString() },
      { onConflict: 'search_term,campaign_id,ad_group_id' }
    );
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Analyzer queries
// ---------------------------------------------------------------------------

export async function getSearchTermsForAnalysis(
  supabase: SupabaseClient,
  filters?: { market?: Market; minClicks?: number }
): Promise<SearchTerm[]> {
  let query = supabase
    .from('search_terms')
    .select('*')
    .order('cost_micros', { ascending: false });

  if (filters?.market) {
    query = query.eq('market', filters.market);
  }
  if (filters?.minClicks !== undefined) {
    query = query.gte('clicks', filters.minClicks);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SearchTerm[];
}

export async function updateSearchTermClassification(
  supabase: SupabaseClient,
  id: number,
  updates: {
    seller_situation?: SellerSituation;
    intent_label?: string;
    is_waste?: boolean;
    is_opportunity?: boolean;
  }
) {
  const { error } = await supabase
    .from('search_terms')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Read queries
// ---------------------------------------------------------------------------

export async function getWasteTerms(supabase: SupabaseClient, market?: Market) {
  let query = supabase
    .from('search_terms')
    .select('*')
    .eq('is_waste', true)
    .order('cost_micros', { ascending: false });

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
    .order('conversions', { ascending: false });

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
