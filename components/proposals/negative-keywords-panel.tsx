'use client';

import { useState } from 'react';
import type { ProposalNegativeKeyword, KeywordMatchType } from '@/types/campaign-proposals';
import { MATCH_TYPE_STYLES, formatKeyword } from '@/lib/proposal-helpers';
import { cn } from '@/lib/utils';

interface NegativeKeywordsPanelProps {
  negatives: ProposalNegativeKeyword[];
}

export function NegativeKeywordsPanel({ negatives }: NegativeKeywordsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<KeywordMatchType | 'all'>('all');

  const filtered = filter === 'all'
    ? negatives
    : negatives.filter((n) => n.match_type === filter);

  const broadCount = negatives.filter((n) => n.match_type === 'BROAD').length;
  const phraseCount = negatives.filter((n) => n.match_type === 'PHRASE').length;
  const exactCount = negatives.filter((n) => n.match_type === 'EXACT').length;

  return (
    <div className="glass-elevated rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-surface-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-risk-red">
            <path
              fillRule="evenodd"
              d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.5-7.5a.5.5 0 010 1h-7a.5.5 0 010-1h7z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Negative Keywords
            </h3>
            <p
              className="text-[10px] text-text-dim mt-0.5"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {negatives.length} negatives · {broadCount} broad · {phraseCount} phrase · {exactCount} exact
            </p>
          </div>
        </div>

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
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-surface-500/20">
          {/* Match type filter */}
          <div className="flex items-center gap-2 pt-4 pb-3">
            {(['all', 'BROAD', 'PHRASE', 'EXACT'] as const).map((type) => {
              const isActive = filter === type;
              const label = type === 'all' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase();
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[10px] uppercase tracking-[0.08em] font-medium transition-colors',
                    isActive
                      ? 'bg-surface-500/50 text-text-primary'
                      : 'text-text-dim hover:text-text-muted hover:bg-surface-700/40'
                  )}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Negative keyword list */}
          <div className="space-y-1.5">
            {filtered.map((neg, i) => {
              const matchStyle = MATCH_TYPE_STYLES[neg.match_type];
              return (
                <div
                  key={`${neg.text}-${i}`}
                  className="flex items-start gap-3 rounded-md bg-surface-700/30 px-3 py-2"
                >
                  <span
                    className={cn(
                      'flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] mt-0.5',
                      matchStyle.bg,
                      matchStyle.text
                    )}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {matchStyle.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[11px] text-risk-red-muted font-medium"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {formatKeyword(neg.text, neg.match_type)}
                    </p>
                    <p className="text-[10px] text-text-dim mt-0.5 leading-relaxed">
                      {neg.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
