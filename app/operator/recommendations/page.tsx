import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRecommendations } from '@/database/queries/recommendations';
import { mockRecommendations } from '@/lib/mock-data';
import { logger } from '@/lib/logger';
import { RecommendationQueueClient } from './queue-client';
import type { Recommendation } from '@/types/recommendations';

export const metadata = {
  title: 'Recommendation Queue | Dominion Ads AI',
};

// ── Data source mode ─────────────────────────────────────────────
// The UI must always tell the operator where the data came from.
// 'live'     — fetched from Supabase successfully.
// 'mock'     — Supabase env vars missing; using static mock data.
// 'degraded' — Supabase configured but fetch failed; showing mock data as fallback.
export type DataSourceMode = 'live' | 'mock' | 'degraded';

interface LoadResult {
  recommendations: Recommendation[];
  mode: DataSourceMode;
  /** Human-readable error message when mode === 'degraded'. */
  error?: string;
}

async function loadRecommendations(): Promise<LoadResult> {
  // ── Mock mode: Supabase not configured ──────────────────────────
  // TODO: Remove mock fallback once Supabase is always configured in all environments.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logger.warn('Supabase not configured — loading mock recommendations');
    return { recommendations: mockRecommendations, mode: 'mock' };
  }

  // ── Live mode: fetch from Supabase ──────────────────────────────
  try {
    const supabase = await createServerSupabaseClient();
    // TODO: Consider server-side filtering by status='pending' to reduce payload.
    // Currently loads all statuses so the operator can switch status filters client-side.
    const data = await getRecommendations(supabase);
    return { recommendations: data, mode: 'live' };
  } catch (err: unknown) {
    // Supabase throws PostgrestError objects (plain objects with `.message`),
    // not Error instances — handle both shapes.
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : String(err);
    logger.error('Failed to load recommendations from Supabase', { error: message });
    // Degraded: show mock data so the operator UI isn't blank, but warn visibly.
    return {
      recommendations: mockRecommendations,
      mode: 'degraded',
      error: message,
    };
  }
}

export default async function RecommendationsPage() {
  const { recommendations, mode, error } = await loadRecommendations();

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold text-text-primary tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Recommendation Queue
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Review and act on AI-generated recommendations to improve ad performance.
        </p>
      </div>

      <RecommendationQueueClient
        initialRecommendations={recommendations}
        dataSourceMode={mode}
        dataSourceError={error}
      />
    </div>
  );
}
