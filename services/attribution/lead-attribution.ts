import type { SupabaseClient } from '@supabase/supabase-js';
import { insertLead, insertAttribution } from '../../database/queries/leads';
import { logger } from '../../lib/logger';
import type { Lead, LeadAttribution } from '../../types/leads';

interface LeadIntakeData {
  lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
  attribution: Omit<LeadAttribution, 'id' | 'lead_id' | 'created_at'>;
}

/**
 * Creates a lead and its attribution record in a single operation.
 * Used when a new lead arrives from a form, call, or other intake channel.
 */
export async function processLeadIntake(
  supabase: SupabaseClient,
  data: LeadIntakeData
): Promise<number> {
  const leadId = await insertLead(supabase, data.lead);

  await insertAttribution(supabase, {
    ...data.attribution,
    lead_id: leadId,
  });

  logger.info('Lead intake processed', {
    leadId,
    market: data.lead.market,
    source: data.attribution.source_channel,
    hasGclid: !!data.attribution.gclid,
  });

  return leadId;
}
