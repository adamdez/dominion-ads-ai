'use client';

import { useState } from 'react';
import type { ProposalAdGroup } from '@/types/campaign-proposals';
import { AD_GROUP_THEME_DESCRIPTIONS } from '@/types/campaign-proposals';
import { Badge } from '@/components/ui/badge';
import {
  THEME_STYLES,
  MATCH_TYPE_STYLES,
  PERFORMANCE_STYLES,
  getThemeLabel,
  formatKeyword,
} from '@/lib/proposal-helpers';
import { cn } from '@/lib/utils';

interface AdGroupCardProps {
  adGroup: ProposalAdGroup;
  index: number;
}

export function AdGroupCard({ adGroup, index }: AdGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0); // First group open by default
  const themeStyle = THEME_STYLES[adGroup.theme];
  const perfStyle = PERFORMANCE_STYLES[adGroup.expected_performance];

  const exactCount = adGroup.keywords.filter((k) => k.match_type === 'EXACT').length;
  const phraseCount = adGroup.keywords.filter((k) => k.match_type === 'PHRASE').length;
  const broadCount = adGroup.keywords.filter((k) => k.match_type === 'BROAD').length;

  return (
    <div
      className={cn(
        'glass-elevated rounded-xl overflow-hidden transition-all duration-300',
        'border-l-[3px]',
        themeStyle.border
      )}
    >
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-surface-700/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg flex-shrink-0">{themeStyle.icon}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary truncate">
              {adGroup.name}
            </h3>
            <p
              className="text-[10px] text-text-dim uppercase tracking-[0.12em] mt-0.5"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {getThemeLabel(adGroup.theme)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Keyword count chips */}
          <span
            className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-surface-600/40"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {adGroup.keywords.length} kw
          </span>
          <Badge className={cn(perfStyle.bg, perfStyle.text, 'text-[10px]')}>
            {perfStyle.label}
          </Badge>
          {/* Expand/collapse chevron */}
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            className={cn(
              'w-4 h-4 text-text-dim transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          >
            <path
              fillRule="evenodd"
              d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-surface-500/20">
          {/* Theme description */}
          <p className="text-xs text-text-muted leading-relaxed pt-4">
            {AD_GROUP_THEME_DESCRIPTIONS[adGroup.theme]}
          </p>

          {/* Rationale */}
          <div>
            <SectionLabel>Strategy Rationale</SectionLabel>
            <p className="text-sm text-text-secondary leading-relaxed">
              {adGroup.rationale}
            </p>
          </div>

          {/* Keywords by match type */}
          <div>
            <SectionLabel>
              Keywords ({adGroup.keywords.length})
              <span className="text-text-dim ml-2 normal-case tracking-normal">
                {exactCount} exact · {phraseCount} phrase · {broadCount} broad
              </span>
            </SectionLabel>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {adGroup.keywords.map((kw, i) => {
                const matchStyle = MATCH_TYPE_STYLES[kw.match_type];
                return (
                  <span
                    key={`${kw.text}-${kw.match_type}-${i}`}
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-1 text-[11px]',
                      matchStyle.bg,
                      matchStyle.text
                    )}
                    style={{ fontFamily: 'var(--font-mono)' }}
                    title={`${matchStyle.label} match`}
                  >
                    {formatKeyword(kw.text, kw.match_type)}
                  </span>
                );
              })}
            </div>
          </div>

          {/* RSA Headlines */}
          <div>
            <SectionLabel>
              RSA Headlines ({adGroup.rsa.headlines.length}/15)
            </SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 mt-2">
              {adGroup.rsa.headlines.map((headline, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md bg-surface-700/40 px-2.5 py-1.5"
                >
                  <span
                    className="text-[11px] text-text-primary truncate"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {headline}
                  </span>
                  <span className="text-[9px] text-text-dim ml-2 flex-shrink-0">
                    {headline.length}/30
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RSA Descriptions */}
          <div>
            <SectionLabel>
              RSA Descriptions ({adGroup.rsa.descriptions.length}/4)
            </SectionLabel>
            <div className="space-y-1.5 mt-2">
              {adGroup.rsa.descriptions.map((desc, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between rounded-md bg-surface-700/40 px-2.5 py-2"
                >
                  <span className="text-[11px] text-text-secondary leading-relaxed" style={{ fontFamily: 'var(--font-mono)' }}>
                    {desc}
                  </span>
                  <span className="text-[9px] text-text-dim ml-2 flex-shrink-0 mt-0.5">
                    {desc.length}/90
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Landing page */}
          <div>
            <SectionLabel>Landing Page</SectionLabel>
            <div className="rounded-md bg-surface-700/40 px-3 py-2 mt-2">
              <p
                className="text-[11px] text-accent-brand"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {adGroup.rsa.final_url}
              </p>
              {adGroup.rsa.display_path && (
                <p
                  className="text-[10px] text-text-dim mt-0.5"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Display: /{adGroup.rsa.display_path[0]}
                  {adGroup.rsa.display_path[1] ? `/${adGroup.rsa.display_path[1]}` : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section label ────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] text-text-dim uppercase tracking-[0.12em] font-medium"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </p>
  );
}
