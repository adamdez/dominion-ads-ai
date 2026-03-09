import type { CampaignProposal } from '@/types/campaign-proposals';
import { ProposalStatusBadge } from './proposal-status-badge';
import { MarketBadge } from '@/components/recommendations/market-badge';
import { RiskBadge } from '@/components/recommendations/risk-badge';
import { getBiddingLabel, getObjectiveLabel } from '@/lib/proposal-helpers';
import { formatDate } from '@/lib/recommendation-helpers';
import { cn } from '@/lib/utils';

interface ProposalHeaderProps {
  proposal: CampaignProposal;
}

export function ProposalHeader({ proposal }: ProposalHeaderProps) {
  return (
    <div className="glass-elevated rounded-xl overflow-hidden">
      {/* Top accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-market-spokane via-accent-brand to-accent-test" />

      <div className="p-6 space-y-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2
              className="text-xl font-semibold text-text-primary tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {proposal.name}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] text-text-dim uppercase tracking-[0.12em]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                v{proposal.version}
              </span>
              <span className="text-text-dim">·</span>
              <span
                className="text-[10px] text-text-dim"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {formatDate(proposal.created_at)}
              </span>
            </div>
          </div>
          <ProposalStatusBadge status={proposal.status} />
        </div>

        {/* Campaign settings grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SettingCell
            label="Campaign Name"
            value={proposal.campaign_name}
            mono
          />
          <SettingCell label="Objective">
            <span className="text-sm text-text-primary font-medium">
              {getObjectiveLabel(proposal.objective)}
            </span>
          </SettingCell>
          <SettingCell label="Bidding">
            <span className="text-sm text-text-primary font-medium">
              {getBiddingLabel(proposal.bidding_strategy)}
            </span>
          </SettingCell>
          <SettingCell label="Daily Budget">
            <span className="text-sm text-accent-brand font-semibold">
              ${proposal.daily_budget_dollars}/day
            </span>
          </SettingCell>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2">
          <MarketBadge market={proposal.market} />
          <RiskBadge level={proposal.risk_level} />
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-0.5 text-[11px]',
              'bg-surface-600/60 text-text-muted'
            )}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {proposal.ad_groups.length} ad groups
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-0.5 text-[11px]',
              'bg-surface-600/60 text-text-muted'
            )}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {proposal.negative_keywords.length} negatives
          </span>
        </div>

        {/* Rationale */}
        <div className="pt-3 border-t border-surface-500/20">
          <p className="text-[10px] text-text-dim uppercase tracking-[0.12em] mb-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
            Campaign Rationale
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            {proposal.campaign_rationale}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Setting cell ─────────────────────────────────────────────────

function SettingCell({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p
        className="text-[10px] text-text-dim uppercase tracking-[0.12em]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </p>
      {children ?? (
        <p
          className={cn('text-sm text-text-primary font-medium truncate')}
          style={mono ? { fontFamily: 'var(--font-mono)' } : undefined}
          title={value}
        >
          {value}
        </p>
      )}
    </div>
  );
}
