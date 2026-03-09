'use client';

import { useState, useMemo } from 'react';
import type { Recommendation, RiskLevel, RecommendationStatus } from '@/types/recommendations';
import type { Market } from '@/types/markets';
import { QueueSummaryBar } from '@/components/recommendations/queue-summary-bar';
import { RecommendationFilters } from '@/components/recommendations/recommendation-filters';
import { RecommendationList } from '@/components/recommendations/recommendation-list';

interface QueueClientProps {
  initialRecommendations: Recommendation[];
}

export function RecommendationQueueClient({
  initialRecommendations,
}: QueueClientProps) {
  // ── State ────────────────────────────────────────────────────
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [marketFilter, setMarketFilter] = useState<Market | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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
  async function handleAction(
    id: number,
    action: 'approved' | 'testing' | 'ignored'
  ) {
    setActionLoading(id);

    try {
      const res = await fetch(`/api/recommendations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        // API returned the updated recommendation — use server state
        const { recommendation: updated } = await res.json() as {
          recommendation: Recommendation;
        };
        setRecommendations((prev) =>
          prev.map((rec) => (rec.id === id ? updated : rec))
        );
      } else {
        // API call failed — apply optimistic update so the UI isn't stuck.
        // This handles both Supabase-not-configured (mock mode) and transient errors.
        console.warn(`Recommendation action API returned ${res.status}, applying optimistic update`);
        setRecommendations((prev) =>
          prev.map((rec) =>
            rec.id === id
              ? { ...rec, status: action, updated_at: new Date().toISOString() }
              : rec
          )
        );
      }
    } catch {
      // Network error or API route not reachable — optimistic fallback
      console.warn('Recommendation action API unreachable, applying optimistic update');
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === id
            ? { ...rec, status: action, updated_at: new Date().toISOString() }
            : rec
        )
      );
    } finally {
      setActionLoading(null);
    }
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
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

      {/* Recommendation cards */}
      <RecommendationList
        recommendations={filtered}
        loadingId={actionLoading}
        onAction={handleAction}
      />
    </div>
  );
}
