import type { SupabaseClient } from '@supabase/supabase-js';
import type { CampaignProposal, ProposalStatus } from '../../types/campaign-proposals';
import type { Market } from '../../types/markets';

// ── Row shape from Supabase ─────────────────────────────────────
// The `campaign_proposals` table stores the full proposal as JSONB
// in `proposal_data`. This interface represents the raw DB row.

export interface ProposalRow {
  id: number;
  name: string;
  version: number;
  market: Market;
  status: ProposalStatus;
  risk_level: string;
  proposal_data: CampaignProposal;
  operator_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalActionRow {
  id: number;
  proposal_id: number;
  action: string;
  decided_by: string;
  reason: string | null;
  decided_at: string;
}

// ── Queries ─────────────────────────────────────────────────────

/**
 * Insert a new campaign proposal.
 *
 * The full CampaignProposal object is stored in `proposal_data` JSONB.
 * Top-level columns (name, version, market, status, risk_level) are
 * extracted for indexing and filtering without parsing JSONB.
 */
export async function insertProposal(
  supabase: SupabaseClient,
  proposal: CampaignProposal
): Promise<number> {
  const { data, error } = await supabase
    .from('campaign_proposals')
    .insert({
      name: proposal.name,
      version: proposal.version,
      market: proposal.market,
      status: proposal.status,
      risk_level: proposal.risk_level,
      proposal_data: proposal,
      operator_notes: proposal.operator_notes ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as number;
}

/**
 * Get a single proposal by database ID.
 * Returns the full ProposalRow including the JSONB proposal_data.
 */
export async function getProposalById(
  supabase: SupabaseClient,
  id: number
): Promise<ProposalRow | null> {
  const { data, error } = await supabase
    .from('campaign_proposals')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    // .single() throws PGRST116 when no rows found
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as ProposalRow;
}

/**
 * Get all proposals, optionally filtered by market and/or status.
 * Ordered by most recently updated first.
 *
 * TODO: Add cursor-based pagination when proposal volume grows.
 */
const PROPOSAL_ROW_LIMIT = 50;

export async function getProposals(
  supabase: SupabaseClient,
  filters?: {
    status?: ProposalStatus;
    market?: Market;
  }
): Promise<ProposalRow[]> {
  let query = supabase
    .from('campaign_proposals')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(PROPOSAL_ROW_LIMIT);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.market) {
    query = query.eq('market', filters.market);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ProposalRow[];
}

/**
 * Update a proposal's status and sync it into the JSONB proposal_data.
 *
 * This keeps the top-level `status` column (used for filtering/indexes)
 * in sync with the nested `proposal_data.status` field.
 */
export async function updateProposalStatus(
  supabase: SupabaseClient,
  id: number,
  status: ProposalStatus,
  operatorNotes?: string
): Promise<ProposalRow> {
  const now = new Date().toISOString();

  // First, get current proposal_data to update status inside JSONB
  const existing = await getProposalById(supabase, id);
  if (!existing) throw new Error(`Proposal ${id} not found`);

  const updatedProposalData = {
    ...existing.proposal_data,
    status,
    updated_at: now,
    ...(operatorNotes !== undefined && { operator_notes: operatorNotes }),
  };

  const updatePayload: Record<string, unknown> = {
    status,
    proposal_data: updatedProposalData,
    updated_at: now,
  };

  if (operatorNotes !== undefined) {
    updatePayload.operator_notes = operatorNotes;
  }

  const { data, error } = await supabase
    .from('campaign_proposals')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ProposalRow;
}

// ── Proposal Actions ────────────────────────────────────────────

/**
 * Record an operator action (approve, request edits, reject) on a proposal.
 *
 * This is the proposal equivalent of the approvals table — a complete
 * audit trail of every decision made on every proposal.
 */
export async function insertProposalAction(
  supabase: SupabaseClient,
  data: {
    proposal_id: number;
    action: string;
    decided_by: string;
    reason?: string;
  }
): Promise<number> {
  const { data: row, error } = await supabase
    .from('proposal_actions')
    .insert({
      proposal_id: data.proposal_id,
      action: data.action,
      decided_by: data.decided_by,
      reason: data.reason ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return row.id as number;
}

/**
 * Get all actions for a given proposal, newest first.
 */
export async function getProposalActions(
  supabase: SupabaseClient,
  proposalId: number
): Promise<ProposalActionRow[]> {
  const { data, error } = await supabase
    .from('proposal_actions')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('decided_at', { ascending: false });
  if (error) throw error;
  return data as ProposalActionRow[];
}
