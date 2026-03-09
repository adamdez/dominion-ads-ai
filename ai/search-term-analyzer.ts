import type { SupabaseClient } from '@supabase/supabase-js';
import type { SearchTerm } from '../types/ads';
import type { Recommendation, RiskLevel } from '../types/recommendations';
import type { SellerSituation } from '../types/seller-situations';
import type { Market } from '../types/markets';
import { classifySellerSituation } from './seller-situation-classifier';
import { getSearchTermsForAnalysis, updateSearchTermClassification } from '../database/queries/search-terms';
import { logger } from '../lib/logger';

// ============================================================
// Types
// ============================================================

export type IntentLabel =
  | 'seller_intent'
  | 'buyer_intent'
  | 'agent_intent'
  | 'junk'
  | 'ambiguous';

export interface SearchTermAnalysis {
  term_id: number;
  search_term: string;
  classification: 'waste' | 'opportunity' | 'neutral';
  intent: IntentLabel;
  seller_situation: SellerSituation | null;
  situation_confidence: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
  market: Market | null;
  waste_reason: string | null;
  opportunity_reason: string | null;
}

export interface NegativeKeywordSuggestion {
  keyword: string;
  match_type: 'exact' | 'phrase';
  reason: string;
  estimated_waste_micros: number;
  source_terms: string[];
}

export interface NewKeywordSuggestion {
  keyword: string;
  match_type: 'exact' | 'phrase';
  reason: string;
  source_term: string;
  clicks: number;
  conversions: number;
  seller_situation: SellerSituation | null;
}

export interface LandingPageOpportunity {
  seller_situation: SellerSituation;
  term_count: number;
  total_clicks: number;
  total_cost_micros: number;
  sample_terms: string[];
  reason: string;
}

export interface MarketSummary {
  market: Market;
  total_terms: number;
  waste_terms: number;
  opportunity_terms: number;
  total_spend_micros: number;
  waste_spend_micros: number;
}

type NewRecommendation = Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>;

export interface SearchTermAnalysisResult {
  analyzed_count: number;
  waste_terms: SearchTermAnalysis[];
  opportunity_terms: SearchTermAnalysis[];
  negative_keyword_suggestions: NegativeKeywordSuggestion[];
  new_keyword_suggestions: NewKeywordSuggestion[];
  landing_page_opportunities: LandingPageOpportunity[];
  market_summaries: MarketSummary[];
  recommendations: NewRecommendation[];
  total_waste_spend_micros: number;
  total_opportunity_conversions: number;
}

// ============================================================
// Configuration — thresholds in micros ($1 = 1,000,000 micros)
// ============================================================

const WASTE_COST_THRESHOLD_MICROS = 20_000_000;   // $20 min spend to flag as waste
const HIGH_WASTE_THRESHOLD_MICROS = 100_000_000;   // $100 — waste regardless of intent
const MIN_CLICKS_FOR_OPPORTUNITY = 2;
const MIN_SITUATION_TERMS_FOR_LANDING_PAGE = 3;

// ============================================================
// Intent classification
// ============================================================

const SELLER_INTENT_PATTERNS: RegExp[] = [
  /sell\s+(my\s+)?(house|home|property|land)/,
  /need\s+to\s+sell/,
  /want\s+to\s+sell/,
  /have\s+to\s+sell/,
  /sell\s+(fast|quick(ly)?|as[\s-]?is|now|today|urgent)/,
  /sell\s+without\s+(realtor|agent|repair|listing|fixing)/,
  /cash\s+(home\s+)?buyer/,
  /we\s+buy\s+(house|home|propert)/,
  /buy\s+my\s+(house|home|property)/,
  /companies?\s+that\s+buy\s+(house|home)/,
  /who\s+buys?\s+(house|home)/,
  /cash\s+offer\s+(for|on)\s+(my\s+)?(house|home)/,
  /sell\s+(inherited|probate|estate)\s+(house|home|property)/,
  /sell\s+(house|home)\s+(in\s+)?(foreclosure|divorce|bankruptcy)/,
  /sell\s+(rental|vacant|damaged|ugly|old|unwanted)\s+(house|home|property)/,
  /sell\s+(house|home)\s+with\s+(tenant|mold|damage|foundation|lien)/,
  /sell\s+(house|home)\s+(during|after|before)\s+(divorce|relocation|foreclosure)/,
  /stop\s+foreclosure/,
  /avoid\s+foreclosure/,
  /behind\s+on\s+(mortgage|payment)/,
  /can'?t\s+(afford|make)\s+(mortgage|payment)/,
  /distressed\s+(house|home|property)/,
  /unwanted\s+(house|home|property)/,
  /get\s+rid\s+of\s+(my\s+)?(house|home|property)/,
  /i?buy\s*houses/,
];

const BUYER_INTENT_PATTERNS: RegExp[] = [
  /(house|home|propert)(y|ies|s)?\s+for\s+sale/,
  /for\s+sale\s+(in|near)\s/,
  /buy\s+a\s+(house|home)/,
  /home\s+search/,
  /house\s+hunting/,
  /real\s+estate\s+listing/,
  /mls\s/,
  /\bmls\b/,
  /cheap\s+(house|home)/,
  /affordable\s+(house|home)/,
  /first[\s-]?time\s+(home\s+)?buyer/,
  /(house|home|apartment|condo)\s+for\s+rent/,
  /rent(al)?\s+(house|home|apartment)/,
  /new\s+construction\s+home/,
  /open\s+house\s+near/,
  /zillow|redfin|trulia|realtor\.com/,
];

const AGENT_INTENT_PATTERNS: RegExp[] = [
  /real\s+estate\s+agent/,
  /\brealtor\b/,
  /listing\s+agent/,
  /buyer'?s?\s+agent/,
  /real\s+estate\s+broker/,
  /top\s+(real\s+estate|realtor)/,
  /best\s+(real\s+estate|realtor)/,
  /find\s+a\s+(realtor|agent)/,
  /hire\s+a\s+(realtor|agent)/,
  /home\s+staging/,
  /how\s+to\s+list\s+(my\s+)?(house|home)/,
  /flat\s+fee\s+(mls|listing)/,
];

const JUNK_PATTERNS: RegExp[] = [
  /house\s+clean(ing|er)/,
  /home\s+clean(ing|er)/,
  /house\s+paint(ing|er)/,
  /home\s+improve(ment)?/,
  /home\s+insurance|homeowners?\s+insurance/,
  /property\s+tax/,
  /property\s+management/,
  /moving\s+compan/,
  /\bmover(s)?\b/,
  /storage\s+unit/,
  /home\s+depot|lowes|lowe'?s/,
  /floor\s+plan/,
  /house\s+plan/,
  /home\s+decor/,
  /interior\s+design/,
  /plumb(er|ing)\b/,
  /electric(al|ian)\b/,
  /\bhvac\b/,
  /roof(ing|er)\b/,
  /landscap(e|ing|er)/,
  /pest\s+control/,
  /home\s+warranty/,
  /home\s+inspection/,
  /home\s+appraisal/,
  /property\s+line/,
  /zoning/,
  /building\s+permit/,
  /home\s+security/,
  /solar\s+panel/,
  /garage\s+door/,
  /window\s+replace/,
  /carpet\s+clean/,
];

// Priority order matters. A search term that matches multiple categories
// gets the first match:  seller > junk > agent > buyer > ambiguous.
// Seller is first so terms like "sell my home" never fall into buyer/agent.
// Junk is second so obvious irrelevant terms are caught before agent/buyer.
export function classifyIntent(text: string): IntentLabel {
  const lower = text.toLowerCase();

  for (const p of SELLER_INTENT_PATTERNS) {
    if (p.test(lower)) return 'seller_intent';
  }
  for (const p of JUNK_PATTERNS) {
    if (p.test(lower)) return 'junk';
  }
  for (const p of AGENT_INTENT_PATTERNS) {
    if (p.test(lower)) return 'agent_intent';
  }
  for (const p of BUYER_INTENT_PATTERNS) {
    if (p.test(lower)) return 'buyer_intent';
  }

  return 'ambiguous';
}

// ============================================================
// Waste / opportunity classification
// ============================================================

function classifyTerm(term: SearchTerm): SearchTermAnalysis {
  const intent = classifyIntent(term.search_term);
  const situation = classifySellerSituation(term.search_term);
  const sellerSituation = situation.situation !== 'low_intent' && situation.situation !== 'unknown'
    ? situation.situation
    : null;

  let classification: SearchTermAnalysis['classification'] = 'neutral';
  let wasteReason: string | null = null;
  let opportunityReason: string | null = null;

  // --- Waste detection ---

  // High spend with zero conversions, regardless of intent
  if (term.cost_micros >= HIGH_WASTE_THRESHOLD_MICROS && term.conversions === 0) {
    classification = 'waste';
    wasteReason = `$${(term.cost_micros / 1_000_000).toFixed(0)} spent with zero conversions`;
  }
  // Non-seller intent with meaningful spend and no conversions
  else if (
    (intent === 'buyer_intent' || intent === 'agent_intent' || intent === 'junk') &&
    term.cost_micros >= WASTE_COST_THRESHOLD_MICROS &&
    term.conversions === 0
  ) {
    const intentName = intent.replace('_', ' ');
    wasteReason = `${intentName} — $${(term.cost_micros / 1_000_000).toFixed(0)} spent, not a motivated seller search`;
    classification = 'waste';
  }
  // Non-seller intent with any spend
  else if (
    (intent === 'junk') &&
    term.clicks > 0
  ) {
    wasteReason = `irrelevant search — ${term.clicks} click(s) on a junk term`;
    classification = 'waste';
  }

  // --- Opportunity detection ---

  if (classification !== 'waste') {
    // Seller intent with conversions — high-value term
    if (intent === 'seller_intent' && term.conversions > 0) {
      opportunityReason = `seller-intent term with ${term.conversions} conversion(s)`;
      classification = 'opportunity';
    }
    // Seller intent with clicks but no keyword — potential new keyword
    else if (intent === 'seller_intent' && term.clicks >= MIN_CLICKS_FOR_OPPORTUNITY && !term.keyword_id) {
      opportunityReason = `seller-intent term with ${term.clicks} click(s), not yet a managed keyword`;
      classification = 'opportunity';
    }
    // Identified seller situation with clicks
    else if (sellerSituation && term.clicks >= MIN_CLICKS_FOR_OPPORTUNITY) {
      opportunityReason = `${situation.situation.replace(/_/g, ' ')} situation detected, ${term.clicks} click(s)`;
      classification = 'opportunity';
    }
  }

  return {
    term_id: term.id,
    search_term: term.search_term,
    classification,
    intent,
    seller_situation: sellerSituation,
    situation_confidence: situation.confidence,
    clicks: term.clicks,
    cost_micros: term.cost_micros,
    conversions: term.conversions,
    market: term.market,
    waste_reason: wasteReason,
    opportunity_reason: opportunityReason,
  };
}

// ============================================================
// Negative keyword extraction
// ============================================================

// Words that must never be suggested as negatives.
// These appear in both waste terms and valid seller-intent terms.
// Example: "estate" appears in "real estate agent" (waste) AND "estate sale" (seller).
const PROTECTED_WORDS = new Set([
  'sell', 'selling', 'house', 'home', 'property', 'buy', 'cash', 'fast', 'quick',
  'offer', 'need', 'want', 'my', 'your', 'we', 'get',
  'sale', 'sales',           // "estate sale", "short sale" are seller-intent
  'estate',                  // "estate sale" = probate lead
  'short',                   // "short sale" = foreclosure lead
  'inherited', 'probate', 'foreclosure', 'divorce', 'vacant', 'rental',
  'landlord', 'tenant', 'repair', 'damage', 'mold', 'foundation',
  'distressed', 'unwanted', 'ugly', 'abandoned',
  'spokane', 'coeur', 'dalene', 'idaho', 'washington', 'kootenai',
  'post', 'falls', 'liberty', 'lake', 'hayden', 'rathdrum',
  'county', 'city',
]);

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'is', 'are', 'was', 'were', 'be', 'been', 'do', 'does', 'did',
  'have', 'has', 'had', 'will', 'would', 'could', 'should', 'can', 'may',
  'not', 'no', 'but', 'if', 'so', 'how', 'what', 'when', 'where', 'who',
  'i', 'me', 'it', 'this', 'that', 'near', 'wa', 'id',
]);

function extractNegativeKeywordSuggestions(
  wasteAnalyses: SearchTermAnalysis[]
): NegativeKeywordSuggestion[] {
  // Count bigrams and unigrams across waste terms
  const bigramCosts = new Map<string, { cost: number; terms: Set<string> }>();
  const unigramCosts = new Map<string, { cost: number; terms: Set<string> }>();

  for (const w of wasteAnalyses) {
    const words = w.search_term.toLowerCase().split(/\s+/).filter(Boolean);

    for (let i = 0; i < words.length - 1; i++) {
      if (STOP_WORDS.has(words[i]) && STOP_WORDS.has(words[i + 1])) continue;
      const bigram = `${words[i]} ${words[i + 1]}`;
      const entry = bigramCosts.get(bigram) ?? { cost: 0, terms: new Set<string>() };
      entry.cost += w.cost_micros;
      entry.terms.add(w.search_term);
      bigramCosts.set(bigram, entry);
    }

    for (const word of words) {
      if (STOP_WORDS.has(word) || PROTECTED_WORDS.has(word) || word.length < 3) continue;
      const entry = unigramCosts.get(word) ?? { cost: 0, terms: new Set<string>() };
      entry.cost += w.cost_micros;
      entry.terms.add(w.search_term);
      unigramCosts.set(word, entry);
    }
  }

  const suggestions: NegativeKeywordSuggestion[] = [];

  // Bigram suggestions (phrase match) — more precise
  for (const [bigram, data] of bigramCosts) {
    if (data.terms.size < 2) continue;
    const bigramWords = bigram.split(' ');
    // Skip only if BOTH words are protected. A bigram like "house cleaning"
    // is still valid (only "house" is protected; "cleaning" signals junk).
    if (bigramWords.every((w) => PROTECTED_WORDS.has(w))) continue;
    suggestions.push({
      keyword: bigram,
      match_type: 'phrase',
      reason: `Appears in ${data.terms.size} waste search terms`,
      estimated_waste_micros: data.cost,
      source_terms: Array.from(data.terms).slice(0, 5),
    });
  }

  // Unigram suggestions (phrase match) — broader
  for (const [word, data] of unigramCosts) {
    if (data.terms.size < 3) continue;
    suggestions.push({
      keyword: word,
      match_type: 'phrase',
      reason: `Appears in ${data.terms.size} waste search terms`,
      estimated_waste_micros: data.cost,
      source_terms: Array.from(data.terms).slice(0, 5),
    });
  }

  suggestions.sort((a, b) => b.estimated_waste_micros - a.estimated_waste_micros);
  return suggestions.slice(0, 25);
}

// ============================================================
// Keyword opportunity extraction
// ============================================================

function extractNewKeywordSuggestions(
  opportunityAnalyses: SearchTermAnalysis[]
): NewKeywordSuggestion[] {
  return opportunityAnalyses
    .filter((a) => a.intent === 'seller_intent' && (a.conversions > 0 || a.clicks >= 3))
    .sort((a, b) => b.conversions - a.conversions || b.clicks - a.clicks)
    .slice(0, 20)
    .map((a) => ({
      keyword: a.search_term,
      match_type: a.conversions > 0 ? 'exact' as const : 'phrase' as const,
      reason: a.opportunity_reason ?? 'Seller intent term with engagement',
      source_term: a.search_term,
      clicks: a.clicks,
      conversions: a.conversions,
      seller_situation: a.seller_situation,
    }));
}

// ============================================================
// Landing page opportunity detection
// ============================================================

function detectLandingPageOpportunities(
  analyses: SearchTermAnalysis[]
): LandingPageOpportunity[] {
  const situationGroups = new Map<SellerSituation, SearchTermAnalysis[]>();

  for (const a of analyses) {
    if (!a.seller_situation) continue;
    const group = situationGroups.get(a.seller_situation) ?? [];
    group.push(a);
    situationGroups.set(a.seller_situation, group);
  }

  const opportunities: LandingPageOpportunity[] = [];

  for (const [situation, terms] of situationGroups) {
    if (terms.length < MIN_SITUATION_TERMS_FOR_LANDING_PAGE) continue;

    const totalClicks = terms.reduce((sum, t) => sum + t.clicks, 0);
    const totalCost = terms.reduce((sum, t) => sum + t.cost_micros, 0);

    if (totalClicks < 5) continue;

    opportunities.push({
      seller_situation: situation,
      term_count: terms.length,
      total_clicks: totalClicks,
      total_cost_micros: totalCost,
      sample_terms: terms.slice(0, 5).map((t) => t.search_term),
      reason: `${terms.length} search terms for ${situation.replace(/_/g, ' ')} situations with ${totalClicks} total clicks — a dedicated landing page could improve conversion rate`,
    });
  }

  return opportunities.sort((a, b) => b.total_clicks - a.total_clicks);
}

// ============================================================
// Market summary
// ============================================================

function buildMarketSummaries(analyses: SearchTermAnalysis[]): MarketSummary[] {
  const marketGroups = new Map<Market, SearchTermAnalysis[]>();

  for (const a of analyses) {
    if (!a.market) continue;
    const group = marketGroups.get(a.market) ?? [];
    group.push(a);
    marketGroups.set(a.market, group);
  }

  const summaries: MarketSummary[] = [];

  for (const [market, terms] of marketGroups) {
    const waste = terms.filter((t) => t.classification === 'waste');
    summaries.push({
      market,
      total_terms: terms.length,
      waste_terms: waste.length,
      opportunity_terms: terms.filter((t) => t.classification === 'opportunity').length,
      total_spend_micros: terms.reduce((s, t) => s + t.cost_micros, 0),
      waste_spend_micros: waste.reduce((s, t) => s + t.cost_micros, 0),
    });
  }

  return summaries;
}

// ============================================================
// Recommendation generation
// ============================================================

function buildRecommendations(
  wasteTerms: SearchTermAnalysis[],
  negSuggestions: NegativeKeywordSuggestion[],
  kwSuggestions: NewKeywordSuggestion[],
  lpOpportunities: LandingPageOpportunity[],
  marketSummaries: MarketSummary[]
): NewRecommendation[] {
  const recs: NewRecommendation[] = [];

  // --- Negative keyword recommendations (green — low risk) ---
  for (const neg of negSuggestions.slice(0, 10)) {
    recs.push({
      recommendation_type: 'negative_keyword',
      reason: `"${neg.keyword}" — ${neg.reason}. Estimated waste: $${(neg.estimated_waste_micros / 1_000_000).toFixed(0)}`,
      expected_impact: `Eliminate spend on ${neg.source_terms.length}+ irrelevant search terms`,
      risk_level: 'green',
      approval_required: false,
      status: 'pending',
      market: null,
      seller_situation: null,
      related_campaign_id: null,
      related_ad_group_id: null,
      related_keyword_id: null,
      related_search_term_id: null,
      related_lead_id: null,
      metadata: {
        keyword: neg.keyword,
        match_type: neg.match_type,
        source_terms: neg.source_terms,
        estimated_waste_micros: neg.estimated_waste_micros,
      },
    });
  }

  // --- New keyword recommendations (yellow — changes campaign structure) ---
  for (const kw of kwSuggestions.slice(0, 10)) {
    recs.push({
      recommendation_type: 'new_keyword',
      reason: `"${kw.keyword}" — ${kw.reason}`,
      expected_impact: kw.conversions > 0
        ? `Already converting (${kw.conversions}) — adding as managed keyword improves bid control`
        : `${kw.clicks} clicks with seller intent — manage bidding directly`,
      risk_level: 'yellow',
      approval_required: true,
      status: 'pending',
      market: null,
      seller_situation: kw.seller_situation,
      related_campaign_id: null,
      related_ad_group_id: null,
      related_keyword_id: null,
      related_search_term_id: null,
      related_lead_id: null,
      metadata: {
        keyword: kw.keyword,
        match_type: kw.match_type,
        clicks: kw.clicks,
        conversions: kw.conversions,
      },
    });
  }

  // --- Landing page recommendations (yellow — experimental) ---
  for (const lp of lpOpportunities.slice(0, 5)) {
    recs.push({
      recommendation_type: 'landing_page_opportunity',
      reason: lp.reason,
      expected_impact: `Dedicated ${lp.seller_situation.replace(/_/g, ' ')} page could improve conversion rate for ${lp.total_clicks} clicks ($${(lp.total_cost_micros / 1_000_000).toFixed(0)} in spend)`,
      risk_level: 'yellow',
      approval_required: true,
      status: 'pending',
      market: null,
      seller_situation: lp.seller_situation,
      related_campaign_id: null,
      related_ad_group_id: null,
      related_keyword_id: null,
      related_search_term_id: null,
      related_lead_id: null,
      metadata: {
        term_count: lp.term_count,
        sample_terms: lp.sample_terms,
        total_clicks: lp.total_clicks,
        total_cost_micros: lp.total_cost_micros,
      },
    });
  }

  // --- Market waste alert (green — informational) ---
  for (const ms of marketSummaries) {
    if (ms.waste_spend_micros > 50_000_000) {
      recs.push({
        recommendation_type: 'waste_alert',
        reason: `${ms.market} market: $${(ms.waste_spend_micros / 1_000_000).toFixed(0)} wasted across ${ms.waste_terms} search terms`,
        expected_impact: `Review and add negatives to recover $${(ms.waste_spend_micros / 1_000_000).toFixed(0)} in wasted spend`,
        risk_level: 'green',
        approval_required: false,
        status: 'pending',
        market: ms.market,
        seller_situation: null,
        related_campaign_id: null,
        related_ad_group_id: null,
        related_keyword_id: null,
        related_search_term_id: null,
        related_lead_id: null,
        metadata: {
          total_terms: ms.total_terms,
          waste_terms: ms.waste_terms,
          opportunity_terms: ms.opportunity_terms,
          waste_spend_micros: ms.waste_spend_micros,
        },
      });
    }
  }

  // --- High-cost individual waste terms (green — flagging) ---
  const topWaste = wasteTerms
    .filter((w) => w.cost_micros >= HIGH_WASTE_THRESHOLD_MICROS)
    .slice(0, 5);

  for (const w of topWaste) {
    recs.push({
      recommendation_type: 'high_cost_waste_term',
      reason: `"${w.search_term}" — ${w.waste_reason}`,
      expected_impact: `Adding as exact match negative saves $${(w.cost_micros / 1_000_000).toFixed(0)}`,
      risk_level: 'green',
      approval_required: false,
      status: 'pending',
      market: w.market,
      seller_situation: null,
      related_campaign_id: null,
      related_ad_group_id: null,
      related_keyword_id: null,
      related_search_term_id: w.term_id,
      related_lead_id: null,
      metadata: {
        search_term: w.search_term,
        intent: w.intent,
        clicks: w.clicks,
        cost_micros: w.cost_micros,
      },
    });
  }

  return recs;
}

// ============================================================
// Main analyzer
// ============================================================

/**
 * Analyzes stored search term data to identify waste and opportunity.
 *
 * IMPORTANT: Metrics on search_terms reflect the most recent sync date
 * range, not cumulative history. Run the analyzer after each sync for
 * accurate results. Historical per-date storage is a future improvement.
 *
 * Steps:
 * 1. Fetches search terms with metrics from the database
 * 2. Classifies each by intent (seller/buyer/agent/junk/ambiguous)
 * 3. Classifies seller situation where detectable
 * 4. Flags waste (wrong intent + spend, or high spend + no conversions)
 * 5. Flags opportunity (seller intent + engagement)
 * 6. Extracts negative keyword suggestions from waste patterns
 * 7. Extracts new keyword suggestions from opportunity terms
 * 8. Detects landing page opportunities by seller situation
 * 9. Generates structured recommendations for the operator queue
 * 10. Persists classification flags back to the database for ALL
 *     analyzed terms (waste, opportunity, and neutral)
 *
 * Rules-based. No ML. Every output is explainable.
 */
export async function analyzeSearchTerms(
  supabase: SupabaseClient,
  market?: Market
): Promise<SearchTermAnalysisResult> {
  logger.info('Search term analysis started', { market });

  const terms = await getSearchTermsForAnalysis(supabase, {
    market,
    minClicks: 0,
  });

  if (terms.length === 0) {
    logger.info('No search terms to analyze');
    return {
      analyzed_count: 0,
      waste_terms: [],
      opportunity_terms: [],
      negative_keyword_suggestions: [],
      new_keyword_suggestions: [],
      landing_page_opportunities: [],
      market_summaries: [],
      recommendations: [],
      total_waste_spend_micros: 0,
      total_opportunity_conversions: 0,
    };
  }

  // Classify every term
  const analyses = terms.map(classifyTerm);

  const wasteTerms = analyses.filter((a) => a.classification === 'waste');
  const opportunityTerms = analyses.filter((a) => a.classification === 'opportunity');

  // Extract actionable suggestions
  const negSuggestions = extractNegativeKeywordSuggestions(wasteTerms);
  const kwSuggestions = extractNewKeywordSuggestions(opportunityTerms);
  const lpOpportunities = detectLandingPageOpportunities(analyses);
  const marketSummaries = buildMarketSummaries(analyses);

  // Build recommendations for the approval queue
  const recommendations = buildRecommendations(
    wasteTerms,
    negSuggestions,
    kwSuggestions,
    lpOpportunities,
    marketSummaries
  );

  // Persist classifications back to DB for every analyzed term so the
  // intent_label and flags stay current even if a term flips from waste
  // to neutral between runs.
  let updateCount = 0;
  for (const a of analyses) {
    await updateSearchTermClassification(supabase, a.term_id, {
      is_waste: a.classification === 'waste',
      is_opportunity: a.classification === 'opportunity',
      intent_label: a.intent,
      ...(a.seller_situation ? { seller_situation: a.seller_situation } : {}),
    });
    updateCount++;
  }

  const totalWasteSpend = wasteTerms.reduce((s, t) => s + t.cost_micros, 0);
  const totalOppConversions = opportunityTerms.reduce((s, t) => s + t.conversions, 0);

  logger.info('Search term analysis completed', {
    analyzed: analyses.length,
    waste: wasteTerms.length,
    opportunity: opportunityTerms.length,
    neutral: analyses.length - wasteTerms.length - opportunityTerms.length,
    classifications_updated: updateCount,
    recommendations_generated: recommendations.length,
    total_waste_spend: `$${(totalWasteSpend / 1_000_000).toFixed(0)}`,
  });

  return {
    analyzed_count: analyses.length,
    waste_terms: wasteTerms,
    opportunity_terms: opportunityTerms,
    negative_keyword_suggestions: negSuggestions,
    new_keyword_suggestions: kwSuggestions,
    landing_page_opportunities: lpOpportunities,
    market_summaries: marketSummaries,
    recommendations,
    total_waste_spend_micros: totalWasteSpend,
    total_opportunity_conversions: totalOppConversions,
  };
}
