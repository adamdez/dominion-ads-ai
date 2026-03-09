import type { CampaignProposal } from '@/types/campaign-proposals';
import { countTotalKeywords, countKeywordsByMatchType } from '@/lib/proposal-helpers';
import { cn } from '@/lib/utils';

interface ProposalSummaryBarProps {
  proposal: CampaignProposal;
}

export function ProposalSummaryBar({ proposal }: ProposalSummaryBarProps) {
  const totalKeywords = countTotalKeywords(proposal.ad_groups);
  const matchCounts = countKeywordsByMatchType(proposal.ad_groups);
  const totalHeadlines = proposal.ad_groups.reduce((s, ag) => s + ag.rsa.headlines.length, 0);
  const totalDescriptions = proposal.ad_groups.reduce((s, ag) => s + ag.rsa.descriptions.length, 0);

  const stats = [
    {
      label: 'Ad Groups',
      value: proposal.ad_groups.length,
      color: 'text-accent-brand',
      bg: 'bg-accent-brand/8',
    },
    {
      label: 'Keywords',
      value: totalKeywords,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/8',
      detail: `${matchCounts.EXACT}e · ${matchCounts.PHRASE}p · ${matchCounts.BROAD}b`,
    },
    {
      label: 'Negatives',
      value: proposal.negative_keywords.length,
      color: 'text-risk-red',
      bg: 'bg-risk-red-bg',
    },
    {
      label: 'Headlines',
      value: totalHeadlines,
      color: 'text-sky-400',
      bg: 'bg-sky-500/8',
    },
    {
      label: 'Descriptions',
      value: totalDescriptions,
      color: 'text-violet-400',
      bg: 'bg-violet-500/8',
    },
    {
      label: 'Daily Budget',
      value: `$${proposal.daily_budget_dollars}`,
      color: 'text-amber-400',
      bg: 'bg-amber-500/8',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn('glass rounded-xl px-4 py-3 space-y-1', stat.bg)}
        >
          <p
            className="text-[10px] text-text-dim uppercase tracking-[0.12em]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {stat.label}
          </p>
          <p
            className={cn('text-xl font-semibold', stat.color)}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {stat.value}
          </p>
          {stat.detail && (
            <p
              className="text-[10px] text-text-dim"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {stat.detail}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
