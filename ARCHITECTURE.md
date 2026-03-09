# Architecture — Dominion Home Deals Google Ads Operator System

## Overview

This system is a wholesaling-focused Google Ads operator layer inside the CRM. It syncs ad performance data from Google Ads into Supabase, runs AI analysis to produce structured recommendations, and surfaces those recommendations through an operator dashboard where a human can approve, test, or ignore them. Every action is logged for auditability.

The system is **not** a generic analytics dashboard. It is purpose-built for a real estate wholesaling business that acquires properties in two markets (Spokane County WA, Kootenai County / North Idaho) by generating motivated seller leads through paid search.

## Core Data Flows

### Flow 1: Google Ads → Supabase (Data Ingestion)

```
Google Ads API
  → integrations/google-ads/client.ts    (API calls, auth, pagination)
  → services/sync/google-ads-sync.ts     (idempotent sync, dedup, error handling)
  → database/queries/campaigns.ts        (insert/upsert into Supabase)
  → Supabase tables: campaigns, ad_groups, keywords, search_terms, daily_metrics
  → lib/logger.ts                        (sync status, errors, timing)
```

Sync pulls: campaigns, ad groups, keywords, search terms, and daily cost/click/conversion metrics. Sync is idempotent — re-running the same date range overwrites cleanly. Each sync run is logged.

### Flow 2: Lead Intake → Attribution Storage

```
Lead arrives (form, call, etc.)
  → services/attribution/lead-attribution.ts  (attach source, gclid, campaign, market)
  → database/queries/leads.ts                 (store lead with attribution)
  → Supabase tables: leads, lead_attribution
```

Every lead is tagged with source, campaign, keyword (when available), gclid, landing page, domain, and market. This enables downstream analysis at every level.

### Flow 3: Stored Data → AI Recommendations

```
Cron or manual trigger
  → ai/search-term-analyzer.ts          (waste, opportunity, intent classification)
  → ai/recommendation-engine.ts         (structured recommendations from all data)
  → ai/seller-situation-classifier.ts   (label leads/terms by seller situation)
  → services/recommendations/recommendation-queue.ts  (write to queue)
  → Supabase table: recommendations
```

AI reads stored data only — never calls external APIs on its own. Output is always a structured recommendation object with type, reason, expected impact, risk level, and related entities.

### Flow 4: Recommendations → Operator UI

```
Operator loads dashboard
  → app/operator/ pages                 (Next.js App Router)
  → database/queries/recommendations.ts (fetch pending recommendations)
  → components/recommendations/         (recommendation cards with actions)
  → components/kpi/                     (KPI blocks, market split views)
```

The dashboard shows KPIs, active recommendations, campaign summaries, and an audit log. The operator can approve, test, or ignore each recommendation.

### Flow 5: Approval → Audit Log

```
Operator clicks approve/test/ignore
  → app/api/approvals/route.ts          (API route)
  → services/approvals/approval-service.ts  (validate, record decision)
  → database/queries/approvals.ts       (write approval record)
  → database/queries/implementation-logs.ts (track what changed and when)
  → Supabase tables: approvals, implementation_logs
```

Every approval records: who, what, when, the source recommendation, the decision, and implementation status.

### Flow 6: Deal Progression → Revenue Feedback

```
CRM updates deal stage
  → services/deals/deal-tracking.ts     (update pipeline stage)
  → database/queries/deals.ts           (store stage transitions)
  → Supabase tables: deals, deal_stages
```

Tracks: lead → qualified → appointment → offer → contract → closed deal. This closes the feedback loop — ad spend can be tied to actual revenue.

### Flow 7 (Future): Offline Conversion Feedback

```
Deal reaches target stage
  → services/feedback/offline-conversions.ts  (format for Google Ads upload)
  → integrations/google-ads/client.ts         (upload conversion event)
```

Not built initially. The schema supports it from day one so it can be added without migration.

---

## Folder Structure

```
dominion-ads-ai/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   ├── sync/
│   │   │   └── google-ads/
│   │   │       └── route.ts      # Trigger Google Ads sync
│   │   ├── recommendations/
│   │   │   └── route.ts          # Fetch / update recommendations
│   │   └── approvals/
│   │       └── route.ts          # Record approval decisions
│   └── operator/
│       ├── page.tsx              # Main operator dashboard
│       ├── campaigns/
│       │   └── page.tsx          # Campaign detail view
│       ├── search-terms/
│       │   └── page.tsx          # Search term analysis view
│       ├── recommendations/
│       │   └── page.tsx          # Recommendation queue view
│       └── audit-log/
│           └── page.tsx          # Audit trail view
│
├── components/                   # React components
│   ├── kpi/                      # KPI blocks, market split displays
│   ├── recommendations/          # Recommendation cards, action buttons
│   ├── campaigns/                # Campaign summary tables
│   └── layout/                   # Shell, nav, shared layout
│
├── services/                     # Business logic
│   ├── sync/
│   │   └── google-ads-sync.ts    # Idempotent sync orchestration
│   ├── attribution/
│   │   └── lead-attribution.ts   # Source/campaign/gclid attribution
│   ├── recommendations/
│   │   └── recommendation-queue.ts  # Queue management
│   ├── approvals/
│   │   └── approval-service.ts   # Approval workflow logic
│   ├── deals/
│   │   └── deal-tracking.ts      # Deal pipeline stage tracking
│   └── feedback/
│       └── offline-conversions.ts  # Offline conversion prep (future)
│
├── integrations/                 # External API clients
│   └── google-ads/
│       ├── client.ts             # Google Ads API client (interface-first)
│       ├── types.ts              # Google Ads API response types
│       └── queries.ts            # GAQL query definitions
│
├── ai/                           # AI / recommendation logic
│   ├── Skills_Reference.md       # Existing reference doc
│   ├── search-term-analyzer.ts   # Waste/opportunity/intent classification
│   ├── recommendation-engine.ts  # Core recommendation generator
│   ├── seller-situation-classifier.ts  # Seller situation labeling
│   └── lead-scorer.ts           # Lead quality estimation
│
├── database/                     # Schema and query layer
│   ├── schema.sql                # Full Postgres schema
│   ├── migrations/               # Ordered migration files
│   └── queries/                  # Typed query functions
│       ├── campaigns.ts          # Campaign/ad group/keyword queries
│       ├── search-terms.ts       # Search term queries
│       ├── leads.ts              # Lead and attribution queries
│       ├── recommendations.ts    # Recommendation queue queries
│       ├── approvals.ts          # Approval record queries
│       ├── implementation-logs.ts  # Implementation tracking queries
│       └── deals.ts              # Deal pipeline queries
│
├── types/                        # Shared TypeScript types
│   ├── ads.ts                    # Campaign, ad group, keyword, search term
│   ├── leads.ts                  # Lead, attribution, contact
│   ├── recommendations.ts        # Recommendation, risk level, status
│   ├── approvals.ts              # Approval, implementation log
│   ├── deals.ts                  # Deal, pipeline stage
│   ├── markets.ts                # Market enum, market-specific config
│   └── seller-situations.ts      # Seller situation categories
│
├── lib/                          # Shared utilities
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server-side Supabase client
│   ├── logger.ts                 # Structured logging utility
│   └── config.ts                 # Environment config
│
└── scripts/                      # Dev/ops scripts
    └── run-sync.ts               # Manual sync trigger script
```

---

## Service / Module Map

| Module | Purpose | Depends On |
|---|---|---|
| `lib/supabase` | Supabase client initialization | env config |
| `lib/logger` | Structured logging for all operations | — |
| `types/*` | Shared TypeScript interfaces | — |
| `database/schema.sql` | Postgres table definitions | — |
| `database/queries/*` | Typed query functions for each domain | `lib/supabase`, `types` |
| `integrations/google-ads` | Google Ads API client (interface-first) | `lib/config`, `types/ads` |
| `services/sync` | Orchestrates Google Ads data pull and storage | `integrations/google-ads`, `database/queries`, `lib/logger` |
| `services/attribution` | Attaches source/campaign/market to leads | `database/queries`, `types/leads` |
| `services/recommendations` | Manages recommendation queue lifecycle | `database/queries`, `types/recommendations` |
| `services/approvals` | Records and validates approval decisions | `database/queries`, `types/approvals`, `lib/logger` |
| `services/deals` | Tracks deal pipeline stage transitions | `database/queries`, `types/deals` |
| `services/feedback` | Formats offline conversions for upload (future) | `integrations/google-ads`, `database/queries` |
| `ai/search-term-analyzer` | Classifies search terms: waste, opportunity, intent | `database/queries`, `types` |
| `ai/recommendation-engine` | Generates structured recommendations from stored data | `database/queries`, `ai/*`, `types` |
| `ai/seller-situation-classifier` | Labels leads/terms by seller situation | `types/seller-situations` |
| `ai/lead-scorer` | Estimates deal probability from lead data | `database/queries`, `types/leads` |
| `app/api/*` | Next.js API routes — thin wrappers over services | `services/*` |
| `app/operator/*` | Operator dashboard pages | `database/queries`, `components/*` |
| `components/*` | UI components for the operator dashboard | `types/*` |

---

## Implementation Order

### Phase 1: Foundation
1. `database/schema.sql` — all tables
2. `types/*` — all shared interfaces
3. `lib/supabase` — client setup
4. `lib/logger` — structured logging
5. `lib/config` — env config
6. `database/queries/*` — typed query functions

### Phase 2: Data Ingestion
7. `integrations/google-ads/types.ts` — API response types
8. `integrations/google-ads/queries.ts` — GAQL query strings
9. `integrations/google-ads/client.ts` — API client (interface-first)
10. `services/sync/google-ads-sync.ts` — idempotent sync logic
11. `services/attribution/lead-attribution.ts` — source tagging

### Phase 3: Intelligence
12. `ai/search-term-analyzer.ts` — waste/opportunity/intent
13. `ai/seller-situation-classifier.ts` — seller situation labels
14. `ai/recommendation-engine.ts` — structured recommendation output
15. `services/recommendations/recommendation-queue.ts` — queue management

### Phase 4: Operator UI
16. `components/layout/` — dashboard shell
17. `components/kpi/` — KPI blocks, market split
18. `components/recommendations/` — recommendation cards
19. `components/campaigns/` — campaign tables
20. `app/operator/page.tsx` — main dashboard
21. `app/operator/recommendations/page.tsx` — recommendation queue
22. `app/operator/search-terms/page.tsx` — search term view
23. `app/operator/campaigns/page.tsx` — campaign detail
24. `app/operator/audit-log/page.tsx` — audit trail

### Phase 5: Approval + Audit
25. `services/approvals/approval-service.ts` — workflow logic
26. `app/api/approvals/route.ts` — approval endpoint
27. `database/queries/implementation-logs.ts` — change tracking

### Phase 6: Revenue Feedback
28. `services/deals/deal-tracking.ts` — pipeline stages
29. `ai/lead-scorer.ts` — deal probability
30. `services/feedback/offline-conversions.ts` — conversion upload prep

---

## Risk Level Classification

Used across recommendations and automation:

| Level | Meaning | Examples | Approval |
|---|---|---|---|
| **Green** | Low-risk, informational | Alerts, summaries, anomaly flags, junk negative suggestions | Auto or acknowledge |
| **Yellow** | Moderate, experimental | Budget suggestions, landing page tests, keyword expansion, schedule changes | Review recommended |
| **Red** | High-risk, structural | New campaigns, geo changes, major budget shifts, bidding strategy changes | Human approval required |

---

## Key Design Decisions

1. **Interface-first integrations.** The Google Ads client defines TypeScript interfaces for all API interactions. Real credentials and endpoints are injected via config — never hardcoded or fabricated.

2. **Idempotent sync.** Re-running a sync for the same date range upserts cleanly. No duplicate records, no lost data.

3. **Market separation everywhere.** Spokane and Kootenai are separate in the schema, in queries, in recommendations, and in the UI. They are never merged by default.

4. **Recommendations are data objects.** Every recommendation has: type, reason, expected_impact, risk_level, approval_required, and entity references. No vague advice.

5. **Audit trail is mandatory.** Approvals, sync runs, recommendation actions, and deal stage changes are all logged with timestamps and actor identity.

6. **Schema supports future needs.** Offline conversion feedback, landing page testing, and lead scoring are in the schema from day one even though the code comes later.

7. **No speculative features.** Meta integration, retargeting, and advanced automation are not built until Search economics are proven and the data layer is solid.
