'use client';

import type { Recommendation } from '@/types/recommendations';
import { RecommendationCard } from './recommendation-card';

interface RecommendationListProps {
  recommendations: Recommendation[];
  loadingId: number | null;
  onAction: (id: number, action: 'approved' | 'testing' | 'ignored') => void;
  /** True when any filter is set to something other than the default. */
  hasActiveFilters: boolean;
  /** Total count of all recommendations (before filtering). */
  totalRecommendations: number;
}

/**
 * Distinguishes two empty states:
 *
 * 1. Filters are active and hiding results → "No results match your filters."
 *    The operator can broaden their search.
 *
 * 2. There are truly zero recommendations → "Queue clear — all caught up."
 *    Nothing to act on right now, regardless of filters.
 */
function EmptyState({
  hasActiveFilters,
  totalRecommendations,
}: {
  hasActiveFilters: boolean;
  totalRecommendations: number;
}) {
  // If total > 0 but filtered is 0, the active filters are hiding everything.
  // If total is 0, there are genuinely no recommendations at all.
  const isFilteredOut = hasActiveFilters && totalRecommendations > 0;

  return (
    <div className="glass rounded-xl px-8 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-600/60 mx-auto mb-4 flex items-center justify-center">
        {isFilteredOut ? (
          // Filter icon — implies "adjust filters"
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-6 h-6 text-text-dim"
          >
            <path
              fillRule="evenodd"
              d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          // Checkmark icon — implies "nothing to review"
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-6 h-6 text-text-dim"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <p
        className="text-text-secondary text-sm font-medium mb-1"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {isFilteredOut
          ? 'No recommendations match your filters'
          : 'Queue clear — all caught up'}
      </p>
      <p className="text-text-dim text-xs">
        {isFilteredOut
          ? 'Try adjusting your filters to see more recommendations.'
          : 'New recommendations will appear after the next analysis run.'}
      </p>
    </div>
  );
}

export function RecommendationList({
  recommendations,
  loadingId,
  onAction,
  hasActiveFilters,
  totalRecommendations,
}: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <EmptyState
        hasActiveFilters={hasActiveFilters}
        totalRecommendations={totalRecommendations}
      />
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          isLoading={loadingId === rec.id}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
