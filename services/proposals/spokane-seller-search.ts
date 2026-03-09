/**
 * Spokane Seller Search — Campaign Proposal Generator (v2 — hardened)
 *
 * Generates a complete, ready-to-review Google Ads Search campaign
 * targeting motivated sellers in Spokane County, WA.
 *
 * v2 changes from v1 (critical hardening for first real launch):
 *
 *   STRUCTURE:
 *   - Reduced from 5 ad groups to 4 — eliminated standalone "Urgent Sale"
 *     group which cannibalized Generic Seller Intent keywords. Urgency
 *     keywords folded into the main seller group.
 *
 *   KEYWORDS:
 *   - Eliminated ALL broad match — new account has zero conversion history,
 *     so Smart Bidding cannot optimize broad match. Will burn budget on
 *     irrelevant queries. Broad match can be added after 30+ conversions.
 *   - De-duplicated keywords across ad groups — each keyword now appears
 *     in exactly one group. Prevents internal auction competition.
 *   - Removed low-volume niche terms (foundation issues, mold) that
 *     won't generate enough data to optimize at $30/day.
 *   - Removed informational-intent terms ("inherited house what to do",
 *     "estate sale house") that attract researchers, not sellers.
 *   - Removed investor-attracting terms ("sell investment property") that
 *     compete for wrong audience.
 *
 *   NEGATIVES:
 *   - Fixed "rent" BROAD negative which blocked "sell rental property"
 *     (our actual landlord audience). Replaced with specific "for rent" PHRASE.
 *   - Fixed "lease" BROAD which blocked valid queries. Replaced with
 *     "lease agreement" PHRASE.
 *   - Added wholesaling-specific negatives: "wholesaling", "flip houses",
 *     "real estate investing", "how to", "free".
 *
 *   BIDDING:
 *   - Changed from MAXIMIZE_CONVERSIONS to MAXIMIZE_CLICKS with $12 cap.
 *     A new account with zero conversions has no data for conversion
 *     optimization. Max Clicks builds traffic and conversion data first.
 *     Switch to Max Conversions after 15-30 tracked conversions.
 *
 *   BUDGET:
 *   - Increased from $25 to $30/day. At $30/day across 4 groups
 *     (~$7.50/group), with $5-10 CPCs, each group gets 1-2 clicks/day.
 *     Still tight but sufficient for initial data collection.
 *
 *   RSA COPY:
 *   - Reduced headlines from 15 to 10-12 per group. Fewer headlines
 *     means Google tests combinations faster and finds winners sooner.
 */

import type {
  CampaignProposal,
  ProposalAdGroup,
  ProposalNegativeKeyword,
} from '@/types/campaign-proposals';

// ── Generator ───────────────────────────────────────────────────

export function generateSpokaneSellerSearchProposal(): CampaignProposal {
  const now = new Date().toISOString();

  return {
    id: 'proposal-spokane-seller-search-v2',
    name: 'Spokane Seller Search Campaign',
    version: 2,

    // ── Campaign settings ─────────────────────────────────────
    campaign_name: 'Spokane | Seller Search | Dominion',
    market: 'spokane',
    objective: 'lead_generation',
    bidding_strategy: 'MAXIMIZE_CLICKS',
    daily_budget_dollars: 30,

    // ── Structure ─────────────────────────────────────────────
    ad_groups: buildAdGroups(),
    negative_keywords: buildNegativeKeywords(),

    // ── Landing page ──────────────────────────────────────────
    landing_page_recommendation: {
      url: 'https://dominionhomedeals.com/sell',
      rationale:
        'Dedicated seller landing page at dominionhomedeals.com/sell — live and tested. 3-step form (property info → seller details → situation), trust signals, testimonials, and "Get Your Cash Offer" CTA. Contact options: web form + click-to-call/text. Mobile-first layout. Page load under 2 seconds.',
    },

    // ── Metadata ──────────────────────────────────────────────
    risk_level: 'red',
    status: 'pending_review',
    campaign_rationale:
      'Net-new Search campaign — the first keyword-targeted campaign in the account. Replaces the current PMax-only strategy with a structured approach giving full control over keyword targeting, ad copy, and bid adjustments per seller situation. Spokane is the primary acquisition market. v2 is hardened for a real first launch: no broad match (zero conversion history), de-duplicated keywords, tighter negative list, and Maximize Clicks bidding to build conversion data before switching to Maximize Conversions.',

    assumptions: [
      'Landing page at dominionhomedeals.com/sell is live — 3-step form with UTM capture, TCPA compliance, and call/text CTA',
      'Conversion tracking (form submit + phone call) is configured in Google Ads before launch',
      'Geographic targeting: Spokane County, WA + 15-mile radius',
      'Ad schedule: 6 AM – 10 PM Pacific, all days initially',
      '$30/day is a starting floor — increase to $40-50 for faster learning if budget allows',
      'Switch bidding from Maximize Clicks to Maximize Conversions after 15-30 tracked conversions',
      'No broad match keywords until 30+ conversions prove the conversion funnel works',
      'No call-only ads in v2 — add after phone tracking is verified',
      'Review search term report weekly for first month to catch waste early',
    ],

    created_at: now,
    updated_at: now,
  };
}

// ── Ad Group Builders ───────────────────────────────────────────

function buildAdGroups(): ProposalAdGroup[] {
  return [
    buildSellerIntentGroup(),
    buildAsIsRepairsGroup(),
    buildInheritedProbateGroup(),
    buildLandlordExitGroup(),
  ];
}

// ── 1. Sell My House — Spokane ──────────────────────────────────
// Combines former "Generic Seller Intent" + "Urgent Sale" groups.
// "Sell my house fast" IS the core urgent seller query — splitting it
// into two groups caused keyword cannibalization and diluted budget.
// Urgency headlines/descriptions are included in this group's RSA copy.

function buildSellerIntentGroup(): ProposalAdGroup {
  return {
    id: 'ag-seller-intent',
    name: 'Sell My House — Spokane',
    theme: 'generic_seller_intent',
    expected_performance: 'high',
    rationale:
      'Core high-volume group capturing motivated sellers actively searching for a fast, direct sale. Includes urgency keywords (foreclosure, divorce) because "sell my house fast" IS the urgency signal — a separate group would cannibalize. Exact match for geo-targeted terms ensures tight relevance. Phrase match without geo extends reach while relying on geo targeting settings to keep traffic local.',
    keywords: [
      // Exact — geo-targeted, highest intent
      { text: 'sell my house fast spokane', match_type: 'EXACT' },
      { text: 'sell my house spokane', match_type: 'EXACT' },
      { text: 'we buy houses spokane', match_type: 'EXACT' },
      { text: 'cash home buyers spokane', match_type: 'EXACT' },
      { text: 'sell house for cash spokane', match_type: 'EXACT' },
      { text: 'need to sell house quickly spokane', match_type: 'EXACT' },
      // Exact — urgency/situation specific (no geo — campaign geo handles it)
      { text: 'sell house before foreclosure', match_type: 'EXACT' },
      { text: 'sell house during divorce', match_type: 'EXACT' },
      // Phrase — broader reach, campaign geo targeting limits to Spokane area
      { text: 'sell my house fast', match_type: 'PHRASE' },
      { text: 'we buy houses', match_type: 'PHRASE' },
      { text: 'cash home buyer', match_type: 'PHRASE' },
      { text: 'sell house without realtor', match_type: 'PHRASE' },
      { text: 'sell house fast for cash', match_type: 'PHRASE' },
    ],
    rsa: {
      headlines: [
        'Sell Your Spokane House Fast',       // 27
        'Fast Local Cash Offer',              // 21
        'We Buy Houses in Spokane',           // 25
        'No Repairs Needed',                  // 17
        'Skip the Realtor Fees',              // 21
        'Close in As Few As 7 Days',          // 25
        'Local Spokane Home Buyer',           // 24
        'Get Your Free Cash Offer',           // 24
        'No Commissions or Fees',             // 22
        'Dominion Homes',                     // 14
        'Fair Cash Offer Today',              // 21
        'Your Timeline, Your Terms',          // 25
      ],
      descriptions: [
        'Get a fair cash offer for your Spokane home. No repairs, no fees, close on your terms.',
        'We buy houses in any condition across Spokane. Close on your timeline. Call or text today.',
        'Need to sell fast? We close in as few as 7 days. No commissions, no inspections required.',
        'Facing foreclosure or divorce? Local Spokane buyer makes fair cash offers. Call or text.',
      ],
      final_url: 'https://dominionhomedeals.com/sell',
      display_path: ['Sell-House', 'Spokane'],
    },
  };
}

// ── 2. As-Is / Repairs — Spokane ────────────────────────────────
// Property condition group. Sellers who know their property needs work
// and are looking for a buyer who will take it as-is.

function buildAsIsRepairsGroup(): ProposalAdGroup {
  return {
    id: 'ag-as-is',
    name: 'As-Is / Repairs — Spokane',
    theme: 'as_is_repairs',
    expected_performance: 'high',
    rationale:
      'Targets sellers with damaged, outdated, or neglected properties. These sellers have fewer options — traditional buyers and agents often reject their properties. Low competition and excellent conversion rates. Removed niche terms (foundation, mold) that have very low volume individually; the phrase match "sell house as is" captures those queries anyway.',
    keywords: [
      // Exact — geo-targeted
      { text: 'sell house as is spokane', match_type: 'EXACT' },
      { text: 'sell damaged house spokane', match_type: 'EXACT' },
      { text: 'sell house needing repairs spokane', match_type: 'EXACT' },
      { text: 'sell fixer upper spokane', match_type: 'EXACT' },
      // Phrase — campaign geo handles location
      { text: 'sell house as is', match_type: 'PHRASE' },
      { text: 'sell damaged property', match_type: 'PHRASE' },
      { text: 'sell house needing repairs', match_type: 'PHRASE' },
    ],
    rsa: {
      headlines: [
        'Sell Your House As-Is',              // 20
        'No Repairs Required',                // 19
        'We Buy Damaged Homes',               // 20
        'Any Condition, Cash Offer',           // 25
        'Sell Your Fixer Upper Fast',          // 25
        'Cash for As-Is Homes',               // 20
        'Skip Costly Repairs',                // 19
        'Fair Offer, Any Condition',           // 25
        'Local Spokane Cash Buyer',           // 24
        'No Inspections Needed',              // 21
      ],
      descriptions: [
        'Don\'t spend thousands on repairs. We buy Spokane homes in any condition. Cash offer today.',
        'Foundation, mold, or major damage? We buy it as-is. No repairs, no inspections required.',
        'Your fixer upper is worth cash today. We buy homes in any condition in Spokane County.',
        'Stop worrying about costly repairs. Get a fair cash offer for your as-is property now.',
      ],
      final_url: 'https://dominionhomedeals.com/sell',
      display_path: ['Sell-As-Is', 'Spokane'],
    },
  };
}

// ── 3. Inherited / Probate — Spokane ────────────────────────────
// Estate and inheritance situations. Sellers here have already decided
// to sell — they're looking for the easiest path to close.

function buildInheritedProbateGroup(): ProposalAdGroup {
  return {
    id: 'ag-inherited',
    name: 'Inherited / Probate — Spokane',
    theme: 'inherited_probate',
    expected_performance: 'medium',
    rationale:
      'Targets heirs and executors dealing with inherited properties or probate estates. Often out-of-state, emotionally detached, motivated to settle quickly. Lower search volume but very high conversion intent — they have already decided to sell. Removed informational terms ("inherited house what to do") and ambiguous terms ("estate sale house" which matches yard sales, not property sales).',
    keywords: [
      // Exact — geo-targeted
      { text: 'sell inherited house spokane', match_type: 'EXACT' },
      { text: 'sell probate house spokane', match_type: 'EXACT' },
      // Exact — no geo (low volume, campaign geo handles it)
      { text: 'sell inherited property', match_type: 'EXACT' },
      // Phrase
      { text: 'sell inherited house', match_type: 'PHRASE' },
      { text: 'sell probate property', match_type: 'PHRASE' },
      { text: 'inherited property sale', match_type: 'PHRASE' },
    ],
    rsa: {
      headlines: [
        'Sell Your Inherited Home',           // 23
        'Probate Property? We Buy It',         // 27
        'Inherited a House?',                 // 18
        'Cash Offer for Inherited Home',       // 29
        'We Handle Probate Sales',            // 23
        'No Cleanup Required',               // 19
        'Settle the Estate Quickly',          // 25
        'Get a Fair Cash Offer',              // 21
        'Local Spokane Buyer',                // 19
        'Close on Your Timeline',             // 22
      ],
      descriptions: [
        'Inherited a property in Spokane? We buy inherited homes for cash. No cleanup, no repairs.',
        'Dealing with probate? We make selling estate properties simple. Fast cash offer today.',
        'Out-of-state heir? We handle everything locally. Fast cash offer for your inherited home.',
        'Settling an estate shouldn\'t be stressful. We buy probate properties in any condition.',
      ],
      final_url: 'https://dominionhomedeals.com/sell',
      display_path: ['Inherited-Home', 'Sell'],
    },
  };
}

// ── 4. Landlord Exit — Spokane ──────────────────────────────────
// Tired landlords and rental property owners wanting out.
// Removed investor-attracting terms that bring wrong audience.

function buildLandlordExitGroup(): ProposalAdGroup {
  return {
    id: 'ag-landlord',
    name: 'Landlord Exit — Spokane',
    theme: 'landlord_tenant',
    expected_performance: 'medium',
    rationale:
      'Targets tired landlords and rental property owners with problem tenants. Motivated by management fatigue or financial strain. Our buy-with-tenants-in-place proposition is uniquely valuable. Removed "sell investment property" (attracts investors/flippers, not tired landlords) and "sell rental house" (no geo, too generic). Kept focused on the pain point: wanting out of rental ownership.',
    keywords: [
      // Exact — geo-targeted
      { text: 'sell rental property spokane', match_type: 'EXACT' },
      { text: 'sell house with tenants spokane', match_type: 'EXACT' },
      // Exact — pain-point specific
      { text: 'tired landlord sell property', match_type: 'EXACT' },
      // Phrase
      { text: 'sell rental property', match_type: 'PHRASE' },
      { text: 'sell house with tenants', match_type: 'PHRASE' },
      { text: 'tired of being landlord', match_type: 'PHRASE' },
    ],
    rsa: {
      headlines: [
        'Tired of Being a Landlord?',         // 26
        'Sell Your Rental Property',           // 25
        'We Buy With Tenants In Place',         // 28
        'Problem Tenants? Sell Now',           // 24
        'Cash for Rental Properties',          // 26
        'Done With Property Mgmt?',            // 24
        'No Tenant Eviction Needed',           // 25
        'Local Spokane Buyer',                 // 20
        'Fair Cash Offer Today',              // 21
        'End Landlord Headaches',             // 22
      ],
      descriptions: [
        'Tired of chasing rent? We buy Spokane rentals with tenants in place. No eviction needed.',
        'Done with property management? Get a fair cash offer for your rental property today.',
        'Problem tenants making life difficult? Sell your rental property as-is. Call or text us.',
        'Exit your rental on your terms. We buy landlord properties in any condition in Spokane.',
      ],
      final_url: 'https://dominionhomedeals.com/sell',
      display_path: ['Sell-Rental', 'Spokane'],
    },
  };
}

// ── Negative Keywords ───────────────────────────────────────────
// v2 fixes:
//   - Removed "rent" BROAD (blocked our landlord audience)
//   - Removed "apartment" BROAD (overreaching)
//   - Removed "lease" BROAD (blocked valid queries)
//   - Added wholesaling-specific exclusions
//   - Added informational-intent exclusions

function buildNegativeKeywords(): ProposalNegativeKeyword[] {
  return [
    // ── Realtor/agent traffic ─────────────────────────────────
    { text: 'realtor', match_type: 'BROAD', reason: 'Excludes people looking for realtors — we are direct buyers, not agents' },
    { text: 'real estate agent', match_type: 'PHRASE', reason: 'Excludes people looking for listing agents' },
    { text: 'listing agent', match_type: 'PHRASE', reason: 'Excludes people looking to list with an agent' },
    { text: 'real estate broker', match_type: 'PHRASE', reason: 'Excludes broker searches' },
    { text: 'MLS listing', match_type: 'PHRASE', reason: 'Excludes people wanting to list on MLS' },

    // ── Buyer traffic (we buy, our ads target sellers) ────────
    { text: 'buy a house', match_type: 'PHRASE', reason: 'Excludes home shoppers — we are buyers, our ads target sellers' },
    { text: 'houses for sale', match_type: 'PHRASE', reason: 'Excludes home shoppers browsing listings' },
    { text: 'homes for sale', match_type: 'PHRASE', reason: 'Excludes home shoppers' },
    { text: 'home for sale', match_type: 'PHRASE', reason: 'Excludes individual listing searches' },
    { text: 'zillow', match_type: 'BROAD', reason: 'Excludes Zillow browsing traffic' },
    { text: 'redfin', match_type: 'BROAD', reason: 'Excludes Redfin browsing traffic' },
    { text: 'trulia', match_type: 'BROAD', reason: 'Excludes Trulia browsing traffic' },

    // ── Renter traffic (specific — does NOT block "sell rental") ──
    { text: 'for rent', match_type: 'PHRASE', reason: 'Excludes rental searches without blocking "sell rental property"' },
    { text: 'apartment for rent', match_type: 'PHRASE', reason: 'Excludes apartment rental searches' },
    { text: 'lease agreement', match_type: 'PHRASE', reason: 'Excludes lease paperwork searches' },

    // ── Job/career traffic ────────────────────────────────────
    { text: 'real estate job', match_type: 'PHRASE', reason: 'Excludes RE job seekers' },
    { text: 'real estate career', match_type: 'PHRASE', reason: 'Excludes career seekers' },
    { text: 'real estate license', match_type: 'PHRASE', reason: 'Excludes people getting licensed' },

    // ── Commercial/land (residential only) ────────────────────
    { text: 'commercial property', match_type: 'PHRASE', reason: 'Excludes commercial RE — residential only' },
    { text: 'land for sale', match_type: 'PHRASE', reason: 'Excludes raw land searches' },
    { text: 'vacant lot', match_type: 'PHRASE', reason: 'Excludes lot/land searches' },

    // ── Valuation lookups (informational, not sell intent) ────
    { text: 'home value', match_type: 'PHRASE', reason: 'Excludes Zestimate-type lookups' },
    { text: 'property value', match_type: 'PHRASE', reason: 'Excludes valuation lookups' },
    { text: 'how much is my house worth', match_type: 'PHRASE', reason: 'Excludes valuation queries' },

    // ── Wholesaling/investor traffic (we buy, not teach) ──────
    { text: 'wholesaling', match_type: 'BROAD', reason: 'Excludes other wholesalers searching for deals or education' },
    { text: 'wholesale houses', match_type: 'PHRASE', reason: 'Excludes wholesaling education/competition traffic' },
    { text: 'flip houses', match_type: 'PHRASE', reason: 'Excludes house flipping education searches' },
    { text: 'real estate investing', match_type: 'PHRASE', reason: 'Excludes investor education — not our seller audience' },
    { text: 'real estate course', match_type: 'PHRASE', reason: 'Excludes RE education traffic' },

    // ── Informational intent (high cost, low conversion) ──────
    { text: 'how to', match_type: 'PHRASE', reason: 'Excludes "how to sell my house" informational queries — better for SEO, waste for PPC' },
    { text: 'free', match_type: 'BROAD', reason: 'Excludes freebie seekers — "free home valuation" etc.' },
  ];
}
