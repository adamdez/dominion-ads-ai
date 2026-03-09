import type { SupabaseClient } from '@supabase/supabase-js';
import type { SyncLog } from '../../types/approvals';

export async function insertSyncLog(
  supabase: SupabaseClient,
  data: Omit<SyncLog, 'id'>
) {
  const { error } = await supabase.from('sync_logs').insert(data);
  if (error) throw error;
}

export async function completeSyncLog(
  supabase: SupabaseClient,
  id: number,
  result: { status: string; records_upserted: number; error_message?: string; duration_ms: number }
) {
  const { error } = await supabase
    .from('sync_logs')
    .update({
      ...result,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function getRecentSyncLogs(
  supabase: SupabaseClient,
  syncType?: string,
  limit = 20
) {
  let query = supabase
    .from('sync_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (syncType) {
    query = query.eq('sync_type', syncType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as SyncLog[];
}
