'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Recommendation, RiskLevel, RecommendationStatus } from '@/types/recommendations';
import type { Market } from '@/types/markets';
import type { DataSourceMode } from './page';
import { QueueSummaryBar } from '@/components/recommendations/queue-summary-bar';
import { RecommendationFilters } from '@/components/recommendations/recommendation-filters';
import { RecommendationList } from '@/components/recommendations/recommendation-list';
import { DataSourceBanner } from '@/components/recommendations/data-source-banner';

interface QueueClientProps {
  initialRecommendations: Recommendation[];
  dataSourceMode: DataSourceMode;
  dataSourceError?: string;
}

export function RecommendationQueueClient({
  initialRecommendations,
  dataSourceMode,
  dataSourceError,
}: QueueClientProps) {
  // ── State ────────────────────────────────────────────────────
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [marketFilter, setMarketFilter] = useState<Market | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Action error: stores { recommendationId, message } when an action fails.
  // Cleared when the operator takes another action or dismisses it.
  const [actionError, setActionError] = useState<{
    recommendationId: number;
    message: string;
  } | null>(null);

  // ── Derived values ───────────────────────────────────────────
  const pendingRecs = useMemo(
    () => recommendations.filter((r) => r.status === 'pending'),
    [recommendations]
  );

  const summaryData = useMemo(
    () => ({
      totalPending: pendingRecs.length,
      greenCount: pendingRecs.filter((r) => r.risk_level === 'green').length,
      yellowCount: pendingRecs.filter((r) => r.risk_level === 'yellow').length,
      redCount: pendingRecs.filter((r) => r.risk_level === 'red').length,
      spokaneCount: pendingRecs.filter((r) => r.market === 'spokane').length,
      kootenaiCount: pendingRecs.filter((r) => r.market === 'kootenai').length,
    }),
    [pendingRecs]
  );

  const uniqueTypes = useMemo(
    () => [...new Set(recommendations.map((r) => r.recommendation_type))],
    [recommendations]
  );

  const hasActiveFilters = useMemo(
    () =>
      marketFilter !== 'all' ||
      riskFilter !== 'all' ||
      typeFilter !== 'all' ||
      statusFilter !== 'all',
    [marketFilter, riskFilter, typeFilter, statusFilter]
  );

  const filtered = useMemo(() => {
    return recommendations.filter((rec) => {
      if (marketFilter !== 'all' && rec.market !== marketFilter) return false;
      if (riskFilter !== 'all' && rec.risk_level !== riskFilter) return false;
      if (typeFilter !== 'all' && rec.recommendation_type !== typeFilter) return false;
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      return true;
    });
  }, [recommendations, marketFilter, riskFilter, typeFilter, statusFilter]);

  // ── Action handler ───────────────────────────────────────────
  // TODO: No auth — TEMP_OPERATOR_IDENTITY is hardcoded server-side.
  // When auth is added, user identity will come from session.
  // TODO: Multi-operator concurrency — no locking. If two operators act
  // on the same recommendation simultaneously, last-write wins.
  const handleAction = useCallback(
    async (id: number, action: 'approved' | 'testing' | 'ignored') => {
      setActionLoading(id);
      setActionError(null);

      try {
        const res = await fetch(`/api/recommendations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        if (res.ok) {
          // API returned the updated recommendation — use server state
          const { recommendation: updated } = (await res.json()) as {
            recommendation: Recommendation;
          };
          setRecommendations((prev) =>
            prev.map((rec) => (rec.id === id ? updated : rec))
          );
        } else {
          // API returned an error — do NOT pretend it succeeded.
          // Show the error so the operator knows the action was not persisted.
          const errorBody = await res.json().catch(() => ({ error: 'Unknown error' }));
          const errorMessage =
            typeof errorBody.error === 'string'
              ? errorBody.error
              : `Server returned ${res.status}`;
          setActionError({ recommendationId: id, message: errorMessage });
        }
      } catch {
        // Network error or API route unreachable.
        // Do NOT apply optimistic update — the action was not recorded.
        setActionError({
          recommendationId: id,
          message: 'Network error — action was not saved. Check your connection and try again.',
        });
      } finally {
        setActionLoading(null);
      }
    },
    []
  );

  const dismissError = useCallback(() => setActionError(null), []);

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Data source banner — always visible when not live */}
      <DataSourceBanner mode={dataSourceMode} error={dataSourceError} />

      {/* Summary KPIs */}
      <QueueSummaryBar {...summaryData} />

      {/* Filters */}
      <div className="glass rounded-xl px-5 py-4">
        <RecommendationFilters
          selectedMarket={marketFilter}
          selectedRisk={riskFilter}
          selectedType={typeFilter}
          selectedStatus={statusFilter}
          onMarketChange={setMarketFilter}
          onRiskChange={setRiskFilter}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          recommendationTypes={uniqueTypes}
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-dim" style={{ fontFamily: 'var(--font-mono)' }}>
          {filtered.length} recommendation{filtered.length !== 1 ? 's' : ''}
          {statusFilter !== 'all' ? ` · ${statusFilter}` : ''}
        </p>
      </div>

      {/* Inline action error banner */}
      {actionError && (
        <div className="flex items-start gap-3 rounded-xl border border-risk-red/30 bg-risk-red-bg px-4 py-3">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-risk-red flex-shrink-0 mt-0.5"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-risk-red">Action failed</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {actionError.message}
            </p>
          </div>
          <button
            onClick={dismissError}
            className="text-text-dim hover:text-text-secondary transition-colors flex-shrink-0"
            aria-label="Dismiss error"
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

      {/* Recommendation cards */}
      <RecommendationList
        recommendations={filtered}
        loadingId={actionLoading}
        onAction={handleAction}
        hasActiveFilters={hasActiveFilters}
        totalRecommendations={recommendations.length}
      />
    </div>
  );
}
