# Build Order

This file defines the correct implementation order for the Dominion Home Deals Google Ads Operator System.

## Goal
Build a wholesaling-focused ad operations layer inside the CRM that helps Dominion generate first-party motivated seller leads and reduce reliance on PPL providers.

## Important Context
- This is a real estate wholesaling business.
- This is not a generic real estate marketing app.
- Spokane County and Kootenai / North Idaho are separate markets.
- The system must optimize toward qualified leads, appointments, offers, contracts, and revenue.

## Phase 1: Foundation
### 1. Create project structure
Set up:
- Next.js
- TypeScript
- Tailwind
- Supabase integration structure
- base folders for services, integrations, ai, database, and types

### 2. Define database schema
Create schema for:
- leads
- seller situations
- source attribution
- campaigns
- ad groups
- keywords
- search terms
- calls
- appointments
- offers
- contracts
- deals
- recommendations
- approvals
- implementation logs
- landing page variants

### 3. Define TypeScript types
Create shared types/interfaces for:
- lead records
- ads records
- recommendation records
- audit records
- market segmentation
- seller situation categories

## Phase 2: Data Ingestion
### 4. Build Google Ads sync layer
Create services to pull and store:
- campaign data
- ad group data
- keyword data
- search term data
- cost/click/conversion data

Requirements:
- idempotent sync behavior
- logging
- error handling
- practical service structure

### 5. Build lead source attribution storage
Ensure the system can store:
- source
- campaign
- keyword
- gclid when available
- landing page
- market
- domain / page variant

## Phase 3: First Intelligence Layer
### 6. Build search term mining engine
This is the first important intelligence system.

It should:
- classify intent
- identify waste
- identify opportunity
- map terms to seller situations
- propose negative keywords
- propose new keyword clusters
- propose new landing page opportunities

### 7. Build recommendation queue logic
Create a structured recommendation model with:
- recommendation_type
- reason
- expected_impact
- risk_level
- approval_required
- status

## Phase 4: Operator Interface
### 8. Build the Google Ads operator page
The page should include:
- top KPIs
- market split views
- campaign summaries
- search term insights
- recommendation cards
- approve / test / ignore actions
- audit log view

### 9. Build approval and implementation logging
Track:
- who approved
- what changed
- when it changed
- source recommendation
- implementation status
- outcome notes

## Phase 5: Revenue Feedback Loop
### 10. Build deal-stage tracking
Track:
- lead
- qualified
- appointment
- offer
- contract
- closed deal

### 11. Prepare offline conversion feedback support
Design the system so conversion stages can later be pushed back into ad platforms.

## Phase 6: Expansion
### 12. Add landing page testing support
Track:
- page variant
- domain
- market
- form conversion
- call conversion
- qualified lead rate
- contract rate

### 13. Add retargeting support later
Do not prioritize Meta prospecting early.
Search-first.

## Rules for Development
- do not overbuild too early
- do not automate before measurement exists
- do not mix Spokane and Kootenai reporting prematurely
- do not optimize for cheap leads over real contracts
- do not create multiple full websites by default
- keep DominionHomeDeals.com as the master brand

## Immediate First Tasks
Start with:
1. architecture
2. schema
3. types
4. Google Ads sync design
5. search term mining engine design