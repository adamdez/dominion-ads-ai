# Dominion Ads AI - Operating Guardrails

## Core business reality
This project is for a real estate wholesaling / acquisitions business, not retail real estate.

The system must optimize for:
- qualified seller leads
- appointments
- offers
- contracts
- closed deals
- revenue per source

Do not optimize primarily for:
- clicks
- CTR
- cheap leads
- generic traffic
- vanity metrics

## Market focus
Primary markets:
- Spokane County WA
- Kootenai County / Coeur d'Alene / North Idaho

Treat these as separate markets in:
- campaign strategy
- landing pages
- reporting
- recommendations
- analysis

## Channel priorities
1. Google Search first
2. Google retargeting later
3. Meta retargeting later
4. Meta prospecting only after Search economics are proven

Do not let broad-channel expansion distract from Search.

## Campaign strategy principles
Campaigns should be:
- local
- seller-only
- situation-specific
- direct-buyer in tone
- low on broad generic waste

Prioritize situations such as:
- inherited / probate
- as-is / repairs
- landlord / tenant issues
- urgent sale
- relocation
- foreclosure-related situations

## Brand/domain strategy
DominionHomeDeals.com is the master brand.

Other owned domains are support assets for:
- redirects
- paid search landing tests
- offline URLs
- future experiments

Do not assume multiple full sites should be built.

## Product strategy
The software should:
- ingest data
- analyze search terms
- generate recommendations
- generate campaign proposals
- show operator review workflows
- support approval before risky changes

The software should not rush into uncontrolled automation.

## AI behavior rules
AI should:
- propose
- explain
- quantify likely impact
- assign risk
- support operator approval

AI should not:
- pretend draft work is production-ready
- hide degraded or mock states
- silently fake successful actions
- make risky ad changes without approval

## Engineering rules
Prefer:
- simple architecture
- real data over mock assumptions
- minimal schema changes
- read-only integrations before write actions
- auditability
- truthful UI state

Avoid:
- speculative complexity
- overbuilding
- too many agent frameworks
- automation before trust
- UI polish ahead of useful workflow

## Current build order
1. schema and sync integrity
2. Supabase live
3. recommendation queue live
4. Google Ads read-only sync
5. search term analyzer on live data
6. campaign proposal system
7. approval workflow hardening
8. only later: Google Ads write/deployment actions

## Current strategic memory
Historical screenshot data from a separate legacy account is for strategic reference only.
It is not the source of truth for the new Dominion-connected system.

But the strategic lessons from that old data still matter:
- broad generic seller terms can get clicks but likely leak intent
- phrase/exact seller-intent terms are cleaner
- future campaigns should be more local, seller-only, and situation-specific
- stronger direct-buyer / no-middleman messaging is important