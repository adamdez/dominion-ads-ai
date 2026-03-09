import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRecommendations } from '@/database/queries/recommendations';
import { mockRecommendations } from '@/lib/mock-data';
import { logger } from '@/lib/logger';
import { RecommendationQueueClient } from './queue-client';
import type { Recommendation } from '@/types/recommendations';

export const metadata = {
  title: 'Recommendation Queue | Dominion Ads AI',
};

async function loadRecommendations(): Promise<Recommendation[]> {
  // Fall back to mock data when Supabase is not configured.
  // This keeps the UI functional during local development without a database.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logger.warn('Supabase not configured — loading mock recommendations');
    return mockRecommendations;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const data = await getRecommendations(supabase);
    return data;
  } catch (err) {
    logger.error('Failed to load recommendations from Supabase', {
      error: err instanceof Error ? err.message : String(err),
    });
    // Degrade gracefully — show mock data so the operator UI isn't blank
    return mockRecommendations;
  }
}

export default async function RecommendationsPage() {
  const recommendations = await loadRecommendations();

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

      <RecommendationQueueClient initialRecommendations={recommendations} />
    </div>
  );
}
