import type { SupabaseClient } from '@supabase/supabase-js';
import { insertDeal, updateDealStage } from '../../database/queries/deals';
import { updateLeadStage } from '../../database/queries/leads';
import { logger } from '../../lib/logger';
import type { Deal, DealStage } from '../../types/deals';

type NewDeal = Omit<Deal, 'id' | 'created_at' | 'updated_at'>;

export async function createDeal(supabase: SupabaseClient, data: NewDeal): Promise<number> {
  const dealId = await insertDeal(supabase, data);
  await updateLeadStage(supabase, data.lead_id, data.stage);

  logger.info('Deal created', { dealId, leadId: data.lead_id, market: data.market });
  return dealId;
}

export async function advanceDealStage(
  supabase: SupabaseClient,
  dealId: number,
  leadId: number,
  newStage: DealStage,
  changedBy: string,
  notes?: string
) {
  await updateDealStage(supabase, dealId, newStage, changedBy, notes);
  await updateLeadStage(supabase, leadId, newStage);

  logger.info('Deal stage advanced', { dealId, newStage, changedBy });
}
