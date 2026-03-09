import type { SupabaseClient } from '@supabase/supabase-js';
import type { Campaign, AdGroup, Keyword } from '../../types/ads';
import type { Market } from '../../types/markets';

export async function upsertCampaign(
  supabase: SupabaseClient,
  data: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>
) {
  const { error } = await supabase
    .from('campaigns')
    .upsert(
      { ...data, updated_at: new Date().toISOString() },
      { onConflict: 'google_campaign_id' }
    );
  if (error) throw error;
}

export async function upsertAdGroup(
  supabase: SupabaseClient,
  data: Omit<AdGroup, 'id' | 'created_at' | 'updated_at'>
) {
  const { error } = await supabase
    .from('ad_groups')
    .upsert(
      { ...data, updated_at: new Date().toISOString() },
      { onConflict: 'google_ad_group_id' }
    );
  if (error) throw error;
}

export async function upsertKeyword(
  supabase: SupabaseClient,
  data: Omit<Keyword, 'id' | 'created_at' | 'updated_at'>
) {
  const { error } = await supabase
    .from('keywords')
    .upsert(
      { ...data, updated_at: new Date().toISOString() },
      { onConflict: 'google_keyword_id' }
    );
  if (error) throw error;
}

export async function getCampaignsByMarket(supabase: SupabaseClient, market: Market) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('market', market)
    .order('name');
  if (error) throw error;
  return data as Campaign[];
}

export async function getCampaignIdByGoogleId(
  supabase: SupabaseClient,
  googleCampaignId: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('id')
    .eq('google_campaign_id', googleCampaignId)
    .single();
  if (error) return null;
  return data?.id ?? null;
}
