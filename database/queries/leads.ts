import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lead, LeadAttribution } from '../../types/leads';
import type { Market } from '../../types/markets';

export async function insertLead(
  supabase: SupabaseClient,
  data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>
) {
  const { data: lead, error } = await supabase
    .from('leads')
    .insert(data)
    .select('id')
    .single();
  if (error) throw error;
  return lead.id as number;
}

export async function insertAttribution(
  supabase: SupabaseClient,
  data: Omit<LeadAttribution, 'id' | 'created_at'>
) {
  const { error } = await supabase.from('lead_attribution').insert(data);
  if (error) throw error;
}

export async function getLeadsByMarket(supabase: SupabaseClient, market: Market) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('market', market)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Lead[];
}

export async function getLeadWithAttribution(supabase: SupabaseClient, leadId: number) {
  const { data, error } = await supabase
    .from('leads')
    .select('*, lead_attribution(*)')
    .eq('id', leadId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateLeadStage(
  supabase: SupabaseClient,
  leadId: number,
  stage: Lead['stage']
) {
  const { error } = await supabase
    .from('leads')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', leadId);
  if (error) throw error;
}
