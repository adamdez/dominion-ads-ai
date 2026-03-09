/**
 * Spokane Seller Search — Campaign Proposal Generator
 *
 * Generates a complete, ready-to-review Google Ads Search campaign
 * targeting motivated sellers in Spokane County, WA.
 *
 * Strategy:
 *   - 5 ad groups organized by wholesaling seller themes
 *   - Keywords mix exact + phrase + broad match per group
 *   - Negative keywords exclude realtors, agents, buyers, renters
 *   - RSA copy uses direct buyer messaging — no middleman feel
 *   - Landing page points to a seller-focused lead capture page
 *   - Budget recommendation based on Spokane market CPCs
 *
 * This is a read-only proposal generator. It does NOT create anything
 * in Google Ads. The operator reviews and approves before deployment.
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
    id: 'proposal-spokane-seller-search-v1',
    name: 'Spokane Seller Search Campaign',
    version: 1,

    // ── Campaign settings ─────────────────────────────────────
    campaign_name: 'Spokane | Seller Search | Dominion',
    market: 'spokane',
    objective: 'lead_generation',
    bidding_strategy: 'MAXIMIZE_CONVERSIONS',
    daily_budget_dollars: 25,

    // ── Ad groups ─────────────────────────────────────────────
    ad_groups: buildAdGroups(),

    // ── Negative keywords ─────────────────────────────────────
    negative_keywords: buildNegativeKeywords(),

    // ── Landing page ──────────────────────────────────────────
    landing_page_recommendation: {
      url: 'https://dominionhomedeals.com/sell',
      rationale:
        'Dedicated seller landing page with a simple form, trust signals (local company, BBB, testimonials), and a clear "Get Your Cash Offer" CTA. No navigation distractions — single conversion path. Page should load in under 2 seconds and be mobile-first since 60%+ of motivated seller searches happen on mobile.',
    },

    // ── Metadata ──────────────────────────────────────────────
    risk_level: 'red',
    status: 'pending_review',
    campaign_rationale:
      'This is a net-new Search campaign — the first keyword-targeted campaign in the account. It replaces the current PMax-only strategy with a structured approach that gives full control over keyword targeting, ad copy, and bid adjustments per seller situation. The Spokane market is the primary acquisition area for Dominion Home Deals, making it the highest-priority campaign to launch.',

    assumptions: [
      'Landing page at dominionhomedeals.com/sell exists or will be built before launch',
      'Conversion tracking (form submit + phone call) is configured in Google Ads',
      'Geographic targeting will be set to Spokane County, WA + 15-mile radius',
      'Ad schedule will run 6 AM – 10 PM local time initially',
      '$25/day budget is a starting point — should be adjusted based on first 2 weeks of data',
      'No call-only ads included in v1 — can be added after phone tracking is verified',
    ],

    created_at: now,
    updated_at: now,
  };
}

// ── Ad Group Builders ───────────────────────────────────────────

function buildAdGroups(): ProposalAdGroup[] {
  return [
    buildGenericSellerIntentGroup(),
    buildAsIsRepairsGroup(),
    buildInheritedProbateGroup(),
    buildLandlordTenantGroup(),
    buildUrgentSaleGroup(),
  ];
}

function buildGenericSellerIntentGroup(): ProposalAdGroup {
  return {
    id: 'ag-generic-seller',
    name: 'Generic Seller Intent — Spokane',
    theme: 'generic_seller_intent',
    expected_performance: 'high',
    rationale:
      'Captures the broadest pool of motivated sellers actively looking to sell their home. These searchers may not have a specific distress situation but are exploring options beyond traditional real estate agents. High volume, moderate competition. This group will drive the most impressions and serves as the top-of-funnel entry point.',
    keywords: [
      // Exact match — highest intent
      { text: 'sell my house fast spokane', match_type: 'EXACT' },
      { text: 'sell my house spokane', match_type: 'EXACT' },
      { text: 'we buy houses spokane', match_type: 'EXACT' },
      { text: 'cash home buyers spokane', match_type: 'EXACT' },
      { text: 'sell house for cash spokane', match_type: 'EXACT' },
      { text: 'home buyers near me spokane', match_type: 'EXACT' },
      // Phrase match — broader reach
      { text: 'sell my house fast', match_type: 'PHRASE' },
      { text: 'we buy houses', match_type: 'PHRASE' },
      { text: 'cash home buyer', match_type: 'PHRASE' },
      { text: 'sell house without realtor', match_type: 'PHRASE' },
      { text: 'sell my home quickly', match_type: 'PHRASE' },
      // Broad match — discovery
      { text: 'sell house spokane wa', match_type: 'BROAD' },
      { text: 'buy my house spokane', match_type: 'BROAD' },
    ],
    rsa: {
      headlines: [
        'Sell Your Spokane House Fast',       // 27 chars
        'Cash Offer in 24 Hours',             // 22 chars
        'We Buy Houses in Spokane',           // 25 chars
        'No Repairs Needed',                  // 17 chars
        'Skip the Realtor Fees',              // 21 chars
        'Close in As Few As 7 Days',          // 25 chars
        'Local Spokane Home Buyer',           // 24 chars
        'Get Your Free Cash Offer',           // 24 chars
        'No Commissions or Fees',             // 22 chars
        'Sell As-Is, Any Condition',           // 25 chars
        'Dominion Home Deals',                // 19 chars
        'Trusted Local Buyer',                // 19 chars
        'Fair Cash Offer Today',              // 21 chars
        'We Buy Spokane Homes',               // 20 chars
        'Your Timeline, Your Terms',          // 25 chars
      ],
      descriptions: [
        'Get a fair cash offer for your Spokane home in 24 hours. No repairs, no fees, no hassle.',
        'We buy houses in any condition in Spokane County. Close on your timeline. Call today.',
        'Local Spokane home buyer. No commissions, no inspections. Get your free offer now.',
        'Selling your house doesn\'t have to be stressful. We make it simple with a fair cash offer.',
      ],
      final_url: 'https://dominionhomedeals.com/sell',
      display_path: ['Sell-House', 'Spokane'],
    },
  };
}

function buildAsIsRepairsGroup(): ProposalAdGroup {
  return {
    id: 'ag-as-is-repairs',
    name: 'As-Is / Repairs Needed — Spokane',
    theme: 'as_is_repairs',
    expected_performance: 'high',
    rationale:
      'Targets sellers with damaged, outdated, or neglected properties who cannot afford repairs. These sellers are highly motivated because traditional buyers and agents often reject their properties. Low competition for these terms since most agents avoid this segment. Excellent conversion rates — sellers in this group have fewer options and value the as-is buyer proposition.',
    keywords: [
      { text: 'sell house as is spokane', match_type: 'EXACT' },
      { text: 'sell damaged house spokane', match_type: 'EXACT' },
      { text: 'sell house needing repairs spokane', match_type: 'EXACT' },
      { text: 'sell fixer upper spokane', match_type: 'EXACT' },
      { text: 'sell house with foundation issues', match_type: 'EXACT' },
      { text: 'sell house with mold', match_type: 'EXACT' },
      // Phrase match
      { text: 'sell house as is', match_type: 'PHRASE' },
      { text: 'sell damaged property', match_type: 'PHRASE' },
      { text: 'sell house needing repairs', match_type: 'PHRASE' },
      { text: 'sell ugly house', match_type: 'PHRASE' },
      // Broad match
      { text: 'sell house bad condition spokane', match_type: 'BROAD' },
      { text: 'sell fire damaged house', match_type: 'BROAD' },
    ],
    rsa: {
      headlines: [
        'Sell Your House As-Is',              // 20 chars
        'No Repairs Required',                // 19 chars
        'We Buy Damaged Homes',               // 20 chars
        'Any Condition, Cash Offer',           // 25 chars
        'Foundation Issues? No Problem',       // 29 chars
        'Sell Your Fixer Upper Fast',          // 25 chars
        'Cash for As-Is Homes',               // 20 chars
        'Skip Costly Repairs',                // 19 chars
        'We Buy Ugly Houses',                 // 18 chars
        'Mold, Fire, Flood? We Buy It',        // 28 chars
        'Fair Offer, Any Condition',           // 25 chars
        'Local Spokane Cash Buyer',           // 24 chars
        'Close Fast, Sell As-Is',             // 22 chars
        'No Inspections Needed',              // 21 chars
        'Get Cash for Your Home',             // 22 chars
      ],
      descriptions: [
        'Don\'t spend thousands on repairs. We buy Spokane homes in any condition. Get a cash offer today.',
        'Foundation problems, mold, or major damage? We buy it as-is. No repairs, no inspections.',
        'Your fixer upper is worth cash today. We buy homes in any condition in Spokane County.',
        'Stop worrying about costly repairs. Get a fair cash offer for your as-is property now.',
      ],
      final_url: 'https://dominionhomedeals.com/sell',
      display_path: ['Sell-As-Is', 'Spokane'],
    },
  };
}

function buildInheritedProbateGroup(): ProposalAdGroup {
  return {
    id: 'ag-inherited-probate',
    name: 'Inherited / Probate — Spokane',
    theme: 'inherited_probate',
    expected_performance: 'medium',
    rationale:
      'Targets heirs and executors dealing with inherited properties or probate estates. These sellers are often out of state, emotionally detached from the property, and motivated to close quickly to settle estates. They value simplicity and a buyer who understands the probate process. Lower search volume but very high conversion intent — these sellers have already decided to sell.',
    keywords: [
      { text: 'sell inherited house spokane', match_type: 'EXACT' },
      { text: 'sell probate house spokane', match_type: 'EXACT' },
      { text: 'sell inherited property', match_type: 'EXACT' },
      { text: 'sell estate house fast', match_type: 'EXACT' },
      { text: 'inherited house what to do', match_type: 'EXACT' },
      // Phrase match
      { text: 'sell inherited house', match_type: 'PHRASE' },
      { text: 'sell probate property', match_type: 'PHRASE' },
      { text: 'inherited property sale', match_type: 'PHRASE' },
      { text: 'estate sale house', match_type: 'PHRASE' },
      // Broad match
      { text: 'inherited home spokane sell', match_type: 'BROAD' },
      { text: 'probate real estate spokane', match_type: 'BROAD' },
    ],
    rsa: {
      headlines: [
        'Sell Your Inherited Home',           // 23 chars
        'Probate Property? We Buy It',         // 27 chars
        'Inherited a House?',                 // 18 chars
        'Fast Estate Property Sale',          // 25 chars
        'Cash Offer for Inherited Home',       // 29 chars
        'We Handle Probate Sales',            // 23 chars
        'Sell Estate Property Fast',          // 25 chars
        'No Cleanup Required',               // 19 chars
        'Inherited Home Buyer Spokane',        // 28 chars
        'Settle the Estate Quickly',          // 25 chars
        'We Understand Probate',              // 21 chars
        'Cash Offer in 24 Hours',             // 22 chars
        'Local Spokane Buyer',                // 19 chars
        'Simple Inherited Home Sale',         // 26 chars
        'Close on Your Timeline',             // 22 chars
      ],
      descriptions: [
        'Inherited a property in Spokane? We buy inherited homes for cash. No cleanup, no repairs needed.',
        'Dealing with probate? We make selling estate properties simple. Fair cash offer in 24 hours.',
        'Out-of-state heir? We handle everything locally. Get a fast cash offer for your inherited home.',
        'Settling an estate shouldn\'t be stressful. We buy probate properties in any condition.',
      ],
      final_url: 'https://dominionhomedeals.com/sell',
      display_path: ['Inherited-Home', 'Sell'],
    },
  };
}

function buildLandlordTenantGroup(): ProposalAdGroup {
  return {
    id: 'ag-landlord-tenant',
    name: 'Landlord / Tenant Issues — Spokane',
    theme: 'landlord_tenant',
    expected_performance: 'medium',
    rationale:
      'Targets tired landlords, rental property owners with problem tenants, and investors looking to exit. These sellers are motivated by management fatigue, financial strain from non-paying tenants, or changing regulations. They want a clean exit without tenant complications. Our proposition — buying with tenants in place — is uniquely valuable since traditional buyers and agents avoid occupied properties.',
    keywords: [
      { text: 'sell rental property spokane', match_type: 'EXACT' },
      { text: 'sell house with tenants spokane', match_type: 'EXACT' },
      { text: 'tired landlord sell property', match_type: 'EXACT' },
      { text: 'sell investment property fast', match_type: 'EXACT' },
      { text: 'sell rental house', match_type: 'EXACT' },
      // Phrase match
      { text: 'sell rental property', match_type: 'PHRASE' },
      { text: 'sell house with tenants', match_type: 'PHRASE' },
      { text: 'tired of being landlord', match_type: 'PHRASE' },
      { text: 'sell investment property', match_type: 'PHRASE' },
      // Broad match
      { text: 'sell landlord property spokane', match_type: 'BROAD' },
      { text: 'get rid of rental property', match_type: 'BROAD' },
    ],
    rsa: {
      headlines: [
        'Tired of Being a Landlord?',         // 26 chars
        'Sell Your Rental Property',           // 25 chars
        'We Buy With Tenants In Place',         // 28 chars
        'Exit Your Rental Investment',         // 27 chars
        'Problem Tenants? Sell Now',           // 24 chars
        'Cash for Rental Properties',          // 26 chars
        'Done With Property Mgmt?',            // 24 chars
        'Sell Rental, Keep It Simple',         // 27 chars
        'No Tenant Eviction Needed',           // 25 chars
        'We Buy Rental Homes Fast',            // 24 chars
        'Local Spokane Investor',              // 22 chars
        'Fair Cash Offer Today',              // 21 chars
        'Sell Your Spokane Rental',            // 24 chars
        'End Landlord Headaches',             // 22 chars
        'Cash Out of Your Rental',            // 23 chars
      ],
      descriptions: [
        'Tired of chasing rent? We buy Spokane rental properties with tenants in place. No evictions needed.',
        'Done with property management? Get a fair cash offer for your rental property today.',
        'Problem tenants making your life difficult? Sell your rental property as-is for cash.',
        'Exit your rental investment on your terms. We buy landlord properties in any condition.',
      ],
      final_url: 'https://dominionhomedeals.com/sell',
      display_path: ['Sell-Rental', 'Spokane'],
    },
  };
}

function buildUrgentSaleGroup(): ProposalAdGroup {
  return {
    id: 'ag-urgent-sale',
    name: 'Urgent Sale — Spokane',
    theme: 'urgent_sale',
    expected_performance: 'high',
    rationale:
      'Targets sellers under immediate time pressure — foreclosure, divorce, relocation, or emergency cash needs. These are the highest-intent searchers in the funnel. They have already decided to sell and are looking for the fastest path to close. Competition is moderate but conversion rates are the highest across all groups because urgency eliminates comparison shopping. Speed and certainty of close are the primary value propositions.',
    keywords: [
      { text: 'sell my house fast spokane', match_type: 'EXACT' },
      { text: 'need to sell house quickly spokane', match_type: 'EXACT' },
      { text: 'sell house before foreclosure', match_type: 'EXACT' },
      { text: 'sell house during divorce', match_type: 'EXACT' },
      { text: 'sell house fast for cash', match_type: 'EXACT' },
      { text: 'emergency house sale', match_type: 'EXACT' },
      // Phrase match
      { text: 'sell house fast for cash', match_type: 'PHRASE' },
      { text: 'need to sell house quickly', match_type: 'PHRASE' },
      { text: 'sell house before foreclosure', match_type: 'PHRASE' },
      { text: 'sell house going through divorce', match_type: 'PHRASE' },
      { text: 'relocating need to sell house', match_type: 'PHRASE' },
      // Broad match
      { text: 'urgent home sale spokane', match_type: 'BROAD' },
      { text: 'fast house sale cash', match_type: 'BROAD' },
    ],
    rsa: {
      headlines: [
        'Sell Your House in 7 Days',           // 24 chars
        'Need to Sell Fast?',                 // 18 chars
        'Cash Offer in 24 Hours',             // 22 chars
        'Facing Foreclosure?',                // 19 chars
        'Sell During Divorce Fast',            // 24 chars
        'Relocating? Sell Quick',             // 22 chars
        'Emergency Home Sale',                // 19 chars
        'Close in 7 Days or Less',            // 23 chars
        'We Buy Houses Fast',                 // 18 chars
        'No Waiting, Cash Close',             // 22 chars
        'Stop Foreclosure Now',               // 20 chars
        'Guaranteed Cash Offer',              // 21 chars
        'Fast Closing Spokane',               // 20 chars
        'Your Home Sold This Week',           // 24 chars
        'Skip the Long Listing',              // 21 chars
      ],
      descriptions: [
        'Need to sell fast? Get a guaranteed cash offer in 24 hours. We close in as few as 7 days.',
        'Facing foreclosure or divorce? We buy Spokane homes fast for cash. No delays, no hassle.',
        'Relocating and need to sell now? We make fast cash offers and close on your schedule.',
        'Stop the stress of an urgent sale. Fair cash offer, fast close, zero fees. Call today.',
      ],
      final_url: 'https://dominionhomedeals.com/sell',
      display_path: ['Sell-Fast', 'Spokane'],
    },
  };
}

// ── Negative Keywords ───────────────────────────────────────────

function buildNegativeKeywords(): ProposalNegativeKeyword[] {
  return [
    // Realtor/agent traffic — not our audience
    { text: 'realtor', match_type: 'BROAD', reason: 'Excludes people looking for realtors — we are direct buyers, not agents' },
    { text: 'real estate agent', match_type: 'PHRASE', reason: 'Excludes people looking for listing agents' },
    { text: 'listing agent', match_type: 'PHRASE', reason: 'Excludes people looking to list with an agent' },
    { text: 'real estate broker', match_type: 'PHRASE', reason: 'Excludes broker searches' },
    { text: 'MLS listing', match_type: 'PHRASE', reason: 'Excludes people looking to list on MLS' },

    // Buyer traffic — we buy, not sell
    { text: 'buy a house', match_type: 'PHRASE', reason: 'Excludes people looking to buy a home — we are buyers, our ads target sellers' },
    { text: 'houses for sale', match_type: 'PHRASE', reason: 'Excludes home shoppers browsing listings' },
    { text: 'homes for sale', match_type: 'PHRASE', reason: 'Excludes home shoppers' },
    { text: 'home for sale', match_type: 'PHRASE', reason: 'Excludes individual listing searches' },
    { text: 'zillow', match_type: 'BROAD', reason: 'Excludes Zillow browsing traffic' },
    { text: 'redfin', match_type: 'BROAD', reason: 'Excludes Redfin browsing traffic' },
    { text: 'trulia', match_type: 'BROAD', reason: 'Excludes Trulia browsing traffic' },

    // Renter traffic — not selling
    { text: 'rent', match_type: 'BROAD', reason: 'Excludes rental searches — we are looking for sellers, not renters' },
    { text: 'apartment', match_type: 'BROAD', reason: 'Excludes apartment rental searches' },
    { text: 'lease', match_type: 'BROAD', reason: 'Excludes lease-related searches' },

    // Job/career traffic
    { text: 'real estate job', match_type: 'PHRASE', reason: 'Excludes people looking for real estate jobs' },
    { text: 'real estate career', match_type: 'PHRASE', reason: 'Excludes career seekers' },
    { text: 'real estate license', match_type: 'PHRASE', reason: 'Excludes people getting licensed' },

    // Commercial/land — residential focus only
    { text: 'commercial property', match_type: 'PHRASE', reason: 'Excludes commercial real estate — we buy residential only' },
    { text: 'land for sale', match_type: 'PHRASE', reason: 'Excludes raw land searches' },
    { text: 'vacant lot', match_type: 'PHRASE', reason: 'Excludes lot/land searches' },

    // Price lookups — low intent, high cost
    { text: 'home value', match_type: 'PHRASE', reason: 'Excludes Zestimate-type lookups — informational intent, not sell intent' },
    { text: 'property value', match_type: 'PHRASE', reason: 'Excludes valuation lookups' },
    { text: 'how much is my house worth', match_type: 'PHRASE', reason: 'Excludes valuation queries — may add back later if landing page has a value tool' },
  ];
}
