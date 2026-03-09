import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getProposals } from '@/database/queries/proposals';
import type { ProposalRow } from '@/database/queries/proposals';
import { generateSpokaneSellerSearchProposal } from '@/services/proposals/spokane-seller-search';
import { logger } from '@/lib/logger';
import { ProposalReviewClient } from './review-client';
import type { CampaignProposal } from '@/types/campaign-proposals';

export const metadata = {
  title: 'Campaign Proposals | Dominion Ads AI',
};

// ── Data source mode ─────────────────────────────────────────────
// Same pattern as the recommendations page.
// 'live'     — fetched from Supabase successfully.
// 'mock'     — Supabase env vars missing; using generated proposal.
// 'degraded' — Supabase configured but fetch failed; using generated proposal as fallback.
export type ProposalDataSourceMode = 'live' | 'mock' | 'degraded';

interface LoadResult {
  /** The proposal to review, or null if no proposals exist yet */
  proposal: CampaignProposal | null;
  /** The database ID — only present when loaded from Supabase */
  proposalDbId: number | null;
  mode: ProposalDataSourceMode;
  /** Human-readable error message when mode === 'degraded'. */
  error?: string;
}

function proposalFromRow(row: ProposalRow): { proposal: CampaignProposal; dbId: number } {
  // The JSONB proposal_data contains the full CampaignProposal.
  // Merge the DB-level status/updated_at onto the JSONB in case they diverged.
  const proposal: CampaignProposal = {
    ...row.proposal_data,
    status: row.status,
    updated_at: row.updated_at,
    operator_notes: row.operator_notes ?? undefined,
  };
  return { proposal, dbId: row.id };
}

async function loadProposal(): Promise<LoadResult> {
  // ── Mock mode: Supabase not configured ──────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logger.warn('Supabase not configured — using generated proposal');
    return {
      proposal: generateSpokaneSellerSearchProposal(),
      proposalDbId: null,
      mode: 'mock',
    };
  }

  // ── Live mode: fetch from Supabase ──────────────────────────────
  try {
    const supabase = await createServerSupabaseClient();
    const rows = await getProposals(supabase);

    if (rows.length === 0) {
      // No proposals in DB yet — show generated proposal with a note
      logger.info('No proposals in database — showing generated proposal');
      return {
        proposal: generateSpokaneSellerSearchProposal(),
        proposalDbId: null,
        mode: 'mock',
      };
    }

    // Show the most recently updated proposal (first row, already ordered)
    const { proposal, dbId } = proposalFromRow(rows[0]);
    return {
      proposal,
      proposalDbId: dbId,
      mode: 'live',
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : String(err);
    logger.error('Failed to load proposals from Supabase', { error: message });
    return {
      proposal: generateSpokaneSellerSearchProposal(),
      proposalDbId: null,
      mode: 'degraded',
      error: message,
    };
  }
}

export default async function ProposalsPage() {
  const { proposal, proposalDbId, mode, error } = await loadProposal();

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold text-text-primary tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Campaign Proposals
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Review AI-generated campaign structures before deployment to Google Ads.
        </p>
      </div>

      {proposal ? (
        <ProposalReviewClient
          initialProposal={proposal}
          proposalDbId={proposalDbId}
          dataSourceMode={mode}
          dataSourceError={error}
        />
      ) : (
        <div className="glass rounded-xl px-6 py-10 text-center">
          <p className="text-sm text-text-muted">
            No proposals available. Generate a campaign proposal to get started.
          </p>
        </div>
      )}
    </div>
  );
}
