'use client';

import type { Recommendation } from '@/types/recommendations';
import { RecommendationCard } from './recommendation-card';

interface RecommendationListProps {
  recommendations: Recommendation[];
  loadingId: number | null;
  onAction: (id: number, action: 'approved' | 'testing' | 'ignored') => void;
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="glass rounded-xl px-8 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-600/60 mx-auto mb-4 flex items-center justify-center">
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
      </div>
      <p
        className="text-text-secondary text-sm font-medium mb-1"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {hasFilters
          ? 'No recommendations match your filters'
          : 'Queue clear — all caught up'}
      </p>
      <p className="text-text-dim text-xs">
        {hasFilters
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
}: RecommendationListProps) {
  if (recommendations.length === 0) {
    return <EmptyState hasFilters={true} />;
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
