'use client';

import type { Recommendation } from '@/types/recommendations';
import { RiskBadge } from './risk-badge';
import { StatusBadge } from './status-badge';
import { MarketBadge } from './market-badge';
import { SellerSituationTag } from './seller-situation-tag';
import { RecommendationActions } from './recommendation-actions';
import { RISK_STYLES, getTypeLabel, formatTimeAgo } from '@/lib/recommendation-helpers';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  recommendation: Recommendation;
  isLoading: boolean;
  onAction: (id: number, action: 'approved' | 'testing' | 'ignored') => void;
}

// Type icons — minimal, functional shapes
const TYPE_ICONS: Record<string, React.ReactNode> = {
  negative_keyword: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path
        fillRule="evenodd"
        d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.5-7.5a.5.5 0 010 1h-7a.5.5 0 010-1h7z"
        clipRule="evenodd"
      />
    </svg>
  ),
  new_keyword: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path
        fillRule="evenodd"
        d="M8 15A7 7 0 108 1a7 7 0 000 14zm.75-10.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  landing_page_opportunity: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M4 1.5H3a2 2 0 00-2 2V13a2 2 0 002 2h10a2 2 0 002-2V3.5a2 2 0 00-2-2h-1v1h1a1 1 0 011 1V13a1 1 0 01-1 1H3a1 1 0 01-1-1V3.5a1 1 0 011-1h1v-1z" />
      <path d="M9.5 1a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6 4.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5zM6 7a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3A.5.5 0 016 7zm.5 2.5a.5.5 0 000 1h3a.5.5 0 000-1h-3z" />
    </svg>
  ),
  waste_alert: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path
        fillRule="evenodd"
        d="M7.56 1.22a.5.5 0 01.88 0l6.5 12A.5.5 0 0114.5 14h-13a.5.5 0 01-.44-.74l6.5-12zM8 5a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 7a.75.75 0 100-1.5.75.75 0 000 1.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  high_cost_waste_term: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.5 3a.5.5 0 011 0v.5h.5a2 2 0 010 4H8v1.5h1a.5.5 0 010 1H8v.5a.5.5 0 01-1 0V11H6a.5.5 0 010-1h1V8.5h-.5a2 2 0 010-4H7V4zm0 1.5V7h-.5a1 1 0 010-2h.5zm1 3V11h.5a1 1 0 000-2h-.5z" />
    </svg>
  ),
};

function getSearchTermFromMetadata(metadata: Record<string, unknown>): string | null {
  if (typeof metadata.search_term === 'string') return metadata.search_term;
  if (typeof metadata.keyword === 'string') return metadata.keyword;
  return null;
}

export function RecommendationCard({
  recommendation: rec,
  isLoading,
  onAction,
}: RecommendationCardProps) {
  const riskStyle = RISK_STYLES[rec.risk_level];
  const searchTerm = getSearchTermFromMetadata(rec.metadata);
  const typeIcon = TYPE_ICONS[rec.recommendation_type] ?? TYPE_ICONS.waste_alert;
  const isHighRisk = rec.risk_level === 'red';

  return (
    <div
      className={cn(
        'glass-elevated rounded-xl relative overflow-hidden',
        'transition-all duration-300',
        'hover:border-surface-400/50',
        isHighRisk && rec.status === 'pending' && 'glow-red'
      )}
    >
      {/* Left risk accent bar */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl',
          riskStyle.accent
        )}
      />

      <div className="pl-5 pr-5 py-4 space-y-3">
        {/* Header row: risk + type + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <RiskBadge level={rec.risk_level} />
            <div className="flex items-center gap-1.5 text-text-dim">
              <span className="flex-shrink-0">{typeIcon}</span>
              <span
                className="text-[10px] uppercase tracking-[0.12em] font-medium whitespace-nowrap"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {getTypeLabel(rec.recommendation_type)}
              </span>
            </div>
          </div>
          <StatusBadge status={rec.status} />
        </div>

        {/* Reason */}
        <p className="text-sm text-text-primary font-medium leading-relaxed">
          {rec.reason}
        </p>

        {/* Expected impact */}
        {rec.expected_impact && (
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="text-text-dim text-xs mr-1.5">Impact:</span>
            {rec.expected_impact}
          </p>
        )}

        {/* Tags row: market + seller situation + search term */}
        <div className="flex flex-wrap items-center gap-2">
          <MarketBadge market={rec.market} />
          <SellerSituationTag situation={rec.seller_situation} />
          {searchTerm && (
            <span
              className="inline-flex items-center rounded-md bg-surface-600/60 px-2 py-0.5 text-[11px] text-text-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-3 h-3 mr-1.5 text-text-dim flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              &ldquo;{searchTerm}&rdquo;
            </span>
          )}
        </div>

        {/* Footer: timestamp + actions */}
        <div className="flex items-center justify-between pt-1 border-t border-surface-500/20">
          <span
            className="text-[11px] text-text-dim"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {formatTimeAgo(rec.created_at)}
          </span>

          <RecommendationActions
            recommendationId={rec.id}
            status={rec.status}
            isLoading={isLoading}
            onAction={onAction}
          />
        </div>
      </div>
    </div>
  );
}
