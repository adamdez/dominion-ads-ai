\# Cursor Project Rules



\## Project Type

This is a production-oriented internal software project for Dominion Home Deals.



It is a wholesaling-focused Google Ads operator system inside an existing CRM.



Do not treat this project like:

\- a generic SaaS app

\- a real estate agent website

\- a broad marketing dashboard

\- an experimental AI playground



\## Core Business Rules

1\. This project is for a real estate wholesaling / acquisitions business, not a retail real estate business.

2\. Optimize for contracts and revenue, not just leads.

3\. Spokane County and Kootenai / North Idaho must be treated as separate markets.

4\. Dominion Home Deals is the master brand.

5\. Extra owned domains are support assets, not separate full businesses by default.

6\. Google Search is the first acquisition channel.

7\. Meta is a later-stage channel after Search economics are proven.

8\. AI may recommend changes, but risky changes require human approval.

9\. All important actions must be logged for auditability.



\## Wholesaling Rules

All reporting, AI recommendations, and optimization logic should prioritize:

\- qualified seller leads

\- appointments

\- offers

\- contracts

\- closed deals

\- revenue per source



Do not optimize primarily for:

\- CTR

\- traffic

\- impressions

\- cheap leads

\- raw form volume



North-star performance should focus on:

\- cost per qualified lead

\- cost per appointment

\- cost per offer

\- cost per contract

\- revenue per channel

\- revenue per deal source



\## Seller Situation Rules

Whenever possible, classify leads, search terms, landing pages, and recommendations by seller situation:



\- inherited

\- probate / estate

\- tired landlord

\- tenant issues

\- major repairs

\- foundation / mold / damage

\- divorce

\- foreclosure / pre-foreclosure

\- relocation

\- vacant property

\- low-intent / just exploring



Recommendation logic should use seller-situation performance, not just keyword metrics.



\## Domain Strategy Rules

DominionHomeDeals.com is the master brand and authority site.



Other owned domains are supporting assets for:

\- redirects

\- paid search landing page tests

\- offline marketing URLs

\- call tracking / attribution tests



Do not assume multiple full websites should be built.

Do not duplicate full site content across multiple domains by default.



\## AI Initiative Rules

The AI should be proactive, not passive.



The system should identify and surface recommendations such as:

\- lead form asset opportunities

\- landing page mismatch

\- search term waste

\- high-performing seller-situation clusters

\- market-specific opportunities

\- device-specific performance issues

\- domain / landing page performance insights



Recommendations must be:

\- structured

\- explainable

\- tied to operational actions

\- assigned a risk level



\## Technical Stack

Use these defaults unless explicitly told otherwise:

\- Next.js

\- TypeScript

\- App Router

\- Tailwind CSS

\- Supabase

\- Postgres

\- Vercel



\## Code Quality Rules

\- Use TypeScript everywhere.

\- Prefer simple, readable, maintainable code.

\- Keep modules small and purposeful.

\- Avoid unnecessary dependencies.

\- Do not invent libraries or APIs.

\- Follow official API documentation patterns.

\- Use clear names and practical abstractions.

\- Add comments only where they genuinely help.



\## Architecture Rules

Maintain separation between:

\- UI

\- services

\- integrations

\- AI logic

\- database access

\- types



Suggested structure:

\- app/

\- components/

\- services/

\- integrations/

\- ai/

\- database/

\- types/

\- lib/



\## Data Rules

All recommendation logic must rely on stored data where possible.



The system should support and/or store:

\- campaigns

\- ad groups

\- keywords

\- search terms

\- costs

\- clicks

\- conversions

\- lead attribution

\- gclid when available

\- calls

\- appointments

\- offers

\- contracts

\- closed deals

\- recommendation status

\- approval history

\- implementation logs

\- landing page variants

\- domain attribution

\- market segmentation

\- seller situation classification



\## Automation Rules

Never implement high-risk automation by default.



Risk levels:

\- green = low-risk and potentially auto-executable later

\- yellow = recommendation or experiment

\- red = human approval only



Green examples:

\- alerts

\- summaries

\- anomaly detection

\- obvious junk-negative suggestions

\- sync health alerts



Yellow examples:

\- landing page tests

\- budget suggestions

\- new ad variants

\- lead form asset tests

\- keyword expansion suggestions

\- schedule change suggestions



Red examples:

\- new campaign launches

\- geo targeting changes

\- major budget changes

\- core negative keyword changes

\- major bidding strategy changes



Red actions require human approval.



\## UI Rules

The interface should feel like an operator dashboard, not a cluttered analytics product.



Prefer:

\- clear KPI blocks

\- recommendation cards

\- risk indicators

\- approve / test / ignore actions

\- visible audit trail

\- simple market split views



Avoid:

\- unnecessary charts

\- noisy widgets

\- overly complex controls

\- fake polish without useful function



\## AI Behavior Rules

AI outputs must be structured and explainable.



Recommendations should include:

\- recommendation type

\- reason

\- likely impact

\- risk level

\- approval required

\- related campaign / ad group / search term / lead segment / market / domain



Do not output vague marketing advice with no operational meaning.



\## API Rules

\- Never fabricate endpoints.

\- Never guess request/response fields.

\- If implementing an integration, structure the code so real API details can be inserted safely.

\- Prefer interface-first design when exact credentials or configs are not yet present.



\## Build Order Rules

Default build order:

1\. schema

2\. types

3\. integrations

4\. data sync

5\. recommendation engine

6\. operator UI

7\. approval logging

8\. offline conversion feedback



Do not jump to advanced automation before the data model and sync layer exist.



\## Final Rule

When unsure, choose the simpler and more operationally useful solution.

