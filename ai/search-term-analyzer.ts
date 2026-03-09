import type { SupabaseClient } from '@supabase/supabase-js';
import type { SearchTerm } from '../types/ads';
import type { SellerSituation } from '../types/seller-situations';
import type { Recommendation } from '../types/recommendations';
import type { Market } from '../types/markets';

export interface SearchTermAnalysis {
  term: SearchTerm;
  classification: 'waste' | 'opportunity' | 'neutral';
  seller_situation: SellerSituation | null;
  intent_label: string;
  suggested_action: string | null;
}

export interface SearchTermAnalysisResult {
  waste_terms: SearchTermAnalysis[];
  opportunity_terms: SearchTermAnalysis[];
  negative_keyword_suggestions: string[];
  new_keyword_suggestions: string[];
  recommendations: Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>[];
}

/**
 * Analyzes search terms from stored data to identify waste and opportunity.
 *
 * Responsibilities:
 * - Classify each term as waste, opportunity, or neutral
 * - Map terms to seller situations when possible
 * - Propose negative keywords for waste terms
 * - Propose new keyword clusters from opportunity terms
 * - Generate structured recommendations
 *
 * This is the first intelligence layer built on top of synced Google Ads data.
 */
export async function analyzeSearchTerms(
  _supabase: SupabaseClient,
  _market?: Market
): Promise<SearchTermAnalysisResult> {
  // TODO: implement analysis logic
  // 1. Fetch recent search terms with metrics
  // 2. Classify intent (seller vs buyer vs junk)
  // 3. Map to seller situations
  // 4. Identify high-cost / zero-conversion waste
  // 5. Identify converting terms not yet added as keywords
  // 6. Generate recommendations
  throw new Error('Search term analyzer not yet implemented');
}
