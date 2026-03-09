import type { SupabaseClient } from '@supabase/supabase-js';
import type { Approval, ImplementationLog } from '../../types/approvals';

export async function insertApproval(
  supabase: SupabaseClient,
  data: Omit<Approval, 'id' | 'decided_at'>
) {
  const { data: approval, error } = await supabase
    .from('approvals')
    .insert(data)
    .select('id')
    .single();
  if (error) throw error;
  return approval.id as number;
}

export async function insertImplementationLog(
  supabase: SupabaseClient,
  data: Omit<ImplementationLog, 'id' | 'implemented_at'>
) {
  const { error } = await supabase.from('implementation_logs').insert(data);
  if (error) throw error;
}

export async function getApprovalsByRecommendation(
  supabase: SupabaseClient,
  recommendationId: number
) {
  const { data, error } = await supabase
    .from('approvals')
    .select('*')
    .eq('recommendation_id', recommendationId)
    .order('decided_at', { ascending: false });
  if (error) throw error;
  return data as Approval[];
}

export async function getImplementationLogs(
  supabase: SupabaseClient,
  limit = 50
) {
  const { data, error } = await supabase
    .from('implementation_logs')
    .select('*')
    .order('implemented_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as ImplementationLog[];
}
