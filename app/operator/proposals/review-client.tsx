'use client';

import { useState, useCallback } from 'react';
import type { CampaignProposal, ProposalStatus } from '@/types/campaign-proposals';
import { ProposalHeader } from '@/components/proposals/proposal-header';
import { ProposalSummaryBar } from '@/components/proposals/proposal-summary-bar';
import { AdGroupCard } from '@/components/proposals/ad-group-card';
import { NegativeKeywordsPanel } from '@/components/proposals/negative-keywords-panel';
import { LandingPagePanel } from '@/components/proposals/landing-page-panel';
import { ProposalAssumptions } from '@/components/proposals/proposal-assumptions';
import { ProposalActions } from '@/components/proposals/proposal-actions';
import { PROPOSAL_STATUS_STYLES } from '@/lib/proposal-helpers';

interface ProposalReviewClientProps {
  initialProposal: CampaignProposal;
}

export function ProposalReviewClient({ initialProposal }: ProposalReviewClientProps) {
  const [proposal, setProposal] = useState(initialProposal);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleAction = useCallback(
    (action: 'approved' | 'edits_requested' | 'rejected') => {
      setActionLoading(true);
      setActionResult(null);

      // Simulated — in production this would be an API call to persist
      // the status change and potentially create an audit log entry.
      // TODO: Replace with fetch('/api/proposals/[id]', { method: 'PATCH' })
      setTimeout(() => {
        const newStatus: ProposalStatus = action;
        setProposal((prev) => ({
          ...prev,
          status: newStatus,
          updated_at: new Date().toISOString(),
        }));

        const statusLabel = PROPOSAL_STATUS_STYLES[newStatus].label;
        setActionResult({
          type: 'success',
          message: `Proposal status updated to "${statusLabel}". This action has been recorded locally. In production, this will be persisted to Supabase with a full audit trail.`,
        });
        setActionLoading(false);
      }, 800);
    },
    []
  );

  const dismissResult = useCallback(() => setActionResult(null), []);

  return (
    <div className="space-y-6">
      {/* Status result banner */}
      {actionResult && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
            actionResult.type === 'success'
              ? 'border-accent-approve/30 bg-accent-approve/5'
              : 'border-risk-red/30 bg-risk-red-bg'
          }`}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              actionResult.type === 'success' ? 'text-accent-approve' : 'text-risk-red'
            }`}
          >
            {actionResult.type === 'success' ? (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            )}
          </svg>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                actionResult.type === 'success' ? 'text-accent-approve' : 'text-risk-red'
              }`}
            >
              {actionResult.type === 'success' ? 'Action recorded' : 'Action failed'}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {actionResult.message}
            </p>
          </div>
          <button
            onClick={dismissResult}
            className="text-text-dim hover:text-text-secondary transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M4.28 3.22a.75.75 0 00-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 101.06 1.06L8 9.06l3.72 3.72a.75.75 0 101.06-1.06L9.06 8l3.72-3.72a.75.75 0 00-1.06-1.06L8 6.94 4.28 3.22z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Proposal header — campaign settings + rationale */}
      <ProposalHeader proposal={proposal} />

      {/* Summary stats */}
      <ProposalSummaryBar proposal={proposal} />

      {/* Ad Groups section */}
      <div>
        <h2
          className="text-lg font-semibold text-text-primary tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Ad Groups
        </h2>
        <div className="space-y-3">
          {proposal.ad_groups.map((ag, i) => (
            <AdGroupCard key={ag.id} adGroup={ag} index={i} />
          ))}
        </div>
      </div>

      {/* Negative keywords */}
      <NegativeKeywordsPanel negatives={proposal.negative_keywords} />

      {/* Landing page */}
      <LandingPagePanel recommendation={proposal.landing_page_recommendation} />

      {/* Assumptions */}
      <ProposalAssumptions assumptions={proposal.assumptions} />

      {/* Actions — Approve / Request Edits / Reject */}
      <ProposalActions
        status={proposal.status}
        isLoading={actionLoading}
        onAction={handleAction}
      />

      {/* Future deployment note */}
      <div className="glass rounded-xl px-5 py-4">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-text-dim flex-shrink-0 mt-0.5">
            <path
              fillRule="evenodd"
              d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-9.5a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 018 5.5zM8 12a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-xs text-text-muted leading-relaxed">
              <strong className="text-text-secondary">Google Ads deployment is not yet connected.</strong>{' '}
              Approving this proposal records the decision locally. When the deployment pipeline is built,
              approved proposals will be pushed to Google Ads via the API using the existing OAuth credentials
              and the Google Ads client in <span className="font-mono text-[11px]">integrations/google-ads/client.ts</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
