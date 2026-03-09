import type { Recommendation } from '@/types/recommendations';

/**
 * Mock recommendations matching the real output shape from
 * ai/search-term-analyzer.ts buildRecommendations().
 *
 * TODO: This file exists for dev/demo mode only. Remove or gate behind
 * a feature flag once the system is fully wired to Supabase in all
 * environments. Mock data should never be shown in production.
 *
 * 10 entries covering:
 * - all recommendation types the analyzer produces
 * - both markets (spokane, kootenai)
 * - multiple seller situations
 * - mixed statuses (6 pending, 1 approved, 1 testing, 1 ignored, 1 implemented)
 * - mixed risk levels (green, yellow, red)
 */
export const mockRecommendations: Recommendation[] = [
  // ── Negative keywords (green) ──────────────────────────────────
  {
    id: 1,
    recommendation_type: 'negative_keyword',
    reason:
      '"house cleaning" — Appears in 4 waste search terms across Spokane campaigns. Estimated waste: $87.',
    expected_impact: 'Eliminate spend on 4+ irrelevant search terms',
    risk_level: 'green',
    approval_required: false,
    status: 'pending',
    market: 'spokane',
    seller_situation: null,
    related_campaign_id: 2,
    related_ad_group_id: null,
    related_keyword_id: null,
    related_search_term_id: null,
    related_lead_id: null,
    metadata: {
      keyword: 'house cleaning',
      match_type: 'phrase',
      source_terms: [
        'house cleaning spokane',
        'house cleaning near me spokane',
        'house cleaning service spokane wa',
        'affordable house cleaning spokane',
      ],
      estimated_waste_micros: 87_000_000,
    },
    created_at: '2026-03-07T14:22:00Z',
    updated_at: '2026-03-07T14:22:00Z',
  },
  {
    id: 2,
    recommendation_type: 'negative_keyword',
    reason:
      '"real estate agent" — Appears in 6 waste terms. Agent-intent traffic consuming $142 with zero conversions.',
    expected_impact: 'Block agent-intent queries, save ~$142/month',
    risk_level: 'green',
    approval_required: false,
    status: 'pending',
    market: 'kootenai',
    seller_situation: null,
    related_campaign_id: 5,
    related_ad_group_id: null,
    related_keyword_id: null,
    related_search_term_id: null,
    related_lead_id: null,
    metadata: {
      keyword: 'real estate agent',
      match_type: 'phrase',
      source_terms: [
        'real estate agent coeur dalene',
        'best real estate agent north idaho',
        'top real estate agent post falls',
        'real estate agent near me idaho',
        'find real estate agent kootenai',
        'real estate agent reviews cda',
      ],
      estimated_waste_micros: 142_000_000,
    },
    created_at: '2026-03-07T14:22:00Z',
    updated_at: '2026-03-07T14:22:00Z',
  },
  {
    id: 3,
    recommendation_type: 'negative_keyword',
    reason:
      '"carpet cleaning" — Junk intent pattern. 3 waste terms, $54 total spend, 0 conversions.',
    expected_impact: 'Remove irrelevant service queries from ad groups',
    risk_level: 'green',
    approval_required: false,
    status: 'approved',
    market: 'spokane',
    seller_situation: null,
    related_campaign_id: 2,
    related_ad_group_id: 8,
    related_keyword_id: null,
    related_search_term_id: null,
    related_lead_id: null,
    metadata: {
      keyword: 'carpet cleaning',
      match_type: 'phrase',
      source_terms: [
        'carpet cleaning spokane',
        'carpet cleaning service near me',
        'cheap carpet cleaning spokane valley',
      ],
      estimated_waste_micros: 54_000_000,
    },
    created_at: '2026-03-06T09:15:00Z',
    updated_at: '2026-03-07T10:30:00Z',
  },

  // ── New keywords (yellow) ──────────────────────────────────────
  {
    id: 4,
    recommendation_type: 'new_keyword',
    reason:
      '"sell inherited house spokane" — Seller intent with 5 clicks, 1 conversion. Not currently a targeted keyword.',
    expected_impact:
      'Capture high-intent inherited property sellers with dedicated ad copy',
    risk_level: 'yellow',
    approval_required: true,
    status: 'pending',
    market: 'spokane',
    seller_situation: 'inherited',
    related_campaign_id: 2,
    related_ad_group_id: null,
    related_keyword_id: null,
    related_search_term_id: 14,
    related_lead_id: null,
    metadata: {
      search_term: 'sell inherited house spokane',
      suggested_match_type: 'exact',
      clicks: 5,
      conversions: 1,
      cost_micros: 38_000_000,
    },
    created_at: '2026-03-07T14:22:00Z',
    updated_at: '2026-03-07T14:22:00Z',
  },
  {
    id: 5,
    recommendation_type: 'new_keyword',
    reason:
      '"foreclosure help coeur dalene" — Strong seller intent, 4 clicks, no existing keyword match.',
    expected_impact:
      'Reach foreclosure / pre-foreclosure sellers actively searching for solutions',
    risk_level: 'yellow',
    approval_required: true,
    status: 'pending',
    market: 'kootenai',
    seller_situation: 'foreclosure',
    related_campaign_id: 5,
    related_ad_group_id: null,
    related_keyword_id: null,
    related_search_term_id: 28,
    related_lead_id: null,
    metadata: {
      search_term: 'foreclosure help coeur dalene',
      suggested_match_type: 'phrase',
      clicks: 4,
      conversions: 0,
      cost_micros: 31_000_000,
    },
    created_at: '2026-03-07T14:22:00Z',
    updated_at: '2026-03-07T14:22:00Z',
  },
  {
    id: 6,
    recommendation_type: 'new_keyword',
    reason:
      '"probate property sale washington" — 3 clicks, converting at 33%. High-value probate lead signal.',
    expected_impact:
      'Add exact match keyword to capture probate estate sellers',
    risk_level: 'yellow',
    approval_required: true,
    status: 'testing',
    market: 'spokane',
    seller_situation: 'probate',
    related_campaign_id: 2,
    related_ad_group_id: 7,
    related_keyword_id: null,
    related_search_term_id: 19,
    related_lead_id: null,
    metadata: {
      search_term: 'probate property sale washington',
      suggested_match_type: 'exact',
      clicks: 3,
      conversions: 1,
      cost_micros: 27_000_000,
    },
    created_at: '2026-03-05T11:40:00Z',
    updated_at: '2026-03-06T16:20:00Z',
  },

  // ── Landing page opportunities (yellow) ────────────────────────
  {
    id: 7,
    recommendation_type: 'landing_page_opportunity',
    reason:
      'Tired landlord search terms cluster: 7 terms, 12 clicks, 2 conversions. No dedicated landing page exists.',
    expected_impact:
      'Dedicated page addressing landlord pain points could improve conversion rate by 20-40%',
    risk_level: 'yellow',
    approval_required: true,
    status: 'pending',
    market: 'spokane',
    seller_situation: 'tired_landlord',
    related_campaign_id: 2,
    related_ad_group_id: null,
    related_keyword_id: null,
    related_search_term_id: null,
    related_lead_id: null,
    metadata: {
      seller_situation: 'tired_landlord',
      term_count: 7,
      total_clicks: 12,
      total_conversions: 2,
      sample_terms: [
        'tired of being a landlord spokane',
        'sell rental property fast spokane',
        'landlord sell house spokane county',
      ],
    },
    created_at: '2026-03-07T14:22:00Z',
    updated_at: '2026-03-07T14:22:00Z',
  },
  {
    id: 8,
    recommendation_type: 'landing_page_opportunity',
    reason:
      'Divorce-related search terms cluster: 5 terms, 8 clicks, 1 conversion across Kootenai campaigns.',
    expected_impact:
      'Empathetic divorce-specific landing page could increase qualified leads from this segment',
    risk_level: 'yellow',
    approval_required: true,
    status: 'ignored',
    market: 'kootenai',
    seller_situation: 'divorce',
    related_campaign_id: 5,
    related_ad_group_id: null,
    related_keyword_id: null,
    related_search_term_id: null,
    related_lead_id: null,
    metadata: {
      seller_situation: 'divorce',
      term_count: 5,
      total_clicks: 8,
      total_conversions: 1,
      sample_terms: [
        'sell house during divorce idaho',
        'divorce sell home coeur dalene',
        'need to sell house divorce cda',
      ],
    },
    created_at: '2026-03-05T11:40:00Z',
    updated_at: '2026-03-06T09:15:00Z',
  },

  // ── Waste alert (green) ────────────────────────────────────────
  {
    id: 9,
    recommendation_type: 'waste_alert',
    reason:
      'Spokane campaign "We Buy Houses - Spokane" has $312 in search term waste this period. 18 waste terms identified.',
    expected_impact:
      'Applying recommended negatives could recover ~$312/month in wasted spend',
    risk_level: 'green',
    approval_required: false,
    status: 'pending',
    market: 'spokane',
    seller_situation: null,
    related_campaign_id: 2,
    related_ad_group_id: null,
    related_keyword_id: null,
    related_search_term_id: null,
    related_lead_id: null,
    metadata: {
      campaign_name: 'We Buy Houses - Spokane',
      waste_term_count: 18,
      total_waste_micros: 312_000_000,
      top_waste_terms: [
        { term: 'house cleaning spokane', cost_micros: 87_000_000 },
        { term: 'spokane house for sale zillow', cost_micros: 64_000_000 },
        { term: 'spokane real estate agent reviews', cost_micros: 51_000_000 },
      ],
    },
    created_at: '2026-03-07T14:22:00Z',
    updated_at: '2026-03-07T14:22:00Z',
  },

  // ── High-cost waste term (red) ─────────────────────────────────
  {
    id: 10,
    recommendation_type: 'high_cost_waste_term',
    reason:
      '"homes for sale post falls idaho" — Buyer intent, $187 spent, 14 clicks, 0 conversions. Burning budget on home shoppers.',
    expected_impact:
      'Immediate negative keyword addition saves $187+ per sync period',
    risk_level: 'red',
    approval_required: true,
    status: 'pending',
    market: 'kootenai',
    seller_situation: null,
    related_campaign_id: 5,
    related_ad_group_id: 12,
    related_keyword_id: null,
    related_search_term_id: 42,
    related_lead_id: null,
    metadata: {
      search_term: 'homes for sale post falls idaho',
      intent_label: 'buyer_intent',
      clicks: 14,
      impressions: 89,
      conversions: 0,
      cost_micros: 187_000_000,
    },
    created_at: '2026-03-08T02:15:00Z',
    updated_at: '2026-03-08T02:15:00Z',
  },
];
