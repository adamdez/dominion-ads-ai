# Dominion Ads — Project Status, Goals, and Next Steps

_Last updated: March 9, 2026_

## Purpose of this document
This document is the current source of truth for the Dominion Ads project. It is written so it can be:

- saved in the repo
- pasted into a new ChatGPT conversation
- used as a handoff document for future planning and execution

It is intended to let work resume quickly without losing important context.

---

## 1. What Dominion Ads is
Dominion Ads is the first layer of a broader wholesaling operating system for **Dominion Home Deals**.

It is not just a Google Ads dashboard.

It is being built to help Dominion:

- generate more first-party motivated seller leads
- reduce dependence on pay-per-lead providers
- improve lead quality
- move faster from click to conversation
- turn ad spend into contracts and revenue

The long-term vision is larger than ads, but the current phase is focused on the shortest path to real inbound contracts.

---

## 2. Core business goals
### 90-day goal
- Generate **2 contracts per month** from **first-party inbound**
- Keep **cost per contract at $2,000 or less**

### Primary market
- **Spokane County, Washington**

### Secondary market
- **Kootenai County / Coeur d'Alene / North Idaho**

Spokane is the priority by a wide margin.

---

## 3. What success means
The system should optimize for:

- qualified seller conversations
- appointments
- offers
- contracts
- revenue per source

It should not optimize mainly for:

- clicks
- CTR
- cheap traffic
- raw lead volume without fit

### Dominion's definition of a qualified lead
A qualified lead is:

> a conversation where Dominion is what the customer is actually looking for, even if it does not become a deal

This is an important operating principle.

---

## 4. Strategic campaign lessons already learned
Even though the current connected Google Ads account is new, earlier campaign learnings still shape strategy.

### Current working assumptions
- generic broad seller terms can drive clicks, but often leak intent
- tighter phrase/exact seller-intent terms are cleaner
- future campaigns should be:
  - more local
  - more seller-only
  - more situation-specific
- ad copy should feel:
  - direct
  - local
  - not a call center
  - no middleman
- targeting should not be so narrow that good-fit sellers self-disqualify before contacting Dominion

### Strategic operating rule
The system should aim for **controlled breadth**:
- not broad waste
- not hyper-narrow exclusion

---

## 5. Seller situations that matter most
Historically, Dominion's best deal situations are:

1. **Deceased owner / heirs / spouse situations**, especially with debt or tax issues
2. **Absentee owners**, especially with:
   - financial pressure
   - time pressure
   - landlord fatigue
   - renter issues

### Highest-priority campaign themes
- inherited / probate
- debt / tax distress
- absentee owner / landlord fatigue
- tenant issues
- as-is / repairs
- urgent sale situations

These themes should heavily influence campaign proposals, landing pages, enrichment, and future CRM workflows.

---

## 6. Communication and conversion strategy
Dominion wants customers to have flexible contact options:

- **call**
- **text**
- **web form**

The system should make it comfortable for the seller to choose.

### Important principle
The ads and landing pages should invite conversation, not over-qualify too early.

### Speed-to-lead
Current process:
- Adam or Logan call back in under 1 hour

Target:
- under 10 minutes

This is a major competitive edge against call-center and PPL competitors.

---

## 7. Brand and domain strategy
### Master brand
- **DominionHomeDeals.com**

### Supporting domains
Other owned domains are:
- support assets
- useful for redirects, landing-page tests, and paid search support
- not separate full businesses by default

Do not assume a multi-site empire by default.

---

## 8. Offer language that is true and should be used
The following offer language is considered accurate and strong for Dominion:

- cash offer
- sell as-is
- no repairs
- local buyer
- close on your timeline
- not a call center

These should anchor proposals, landing pages, and ad review.

---

## 9. What the user does NOT want this system to become
The user does **not** want the system to become:

- overcomplicated
- dashboard-heavy
- too manual
- too autonomous too early
- dependent on a single AI model

### Working product philosophy
- AI proposes
- human approves
- system records
- business learns
- only later: safe automation expands

---

## 10. What has been built so far
### A. Project foundation
The repo has a real project foundation, including:
- project context
- rules
- subagents
- skills reference
- operating guardrails

This keeps the build aligned with wholesaling economics rather than generic SaaS assumptions.

### B. Backend architecture and schema
The system has a real backend foundation for:
- Google Ads entities
- recommendations
- approvals
- implementation logs
- leads
- attribution
- deals
- landing page variants
- sync logs
- campaign proposals
- proposal actions

### C. Sync integrity fixes
A major bug was found and fixed:
- internal DB foreign keys were previously being confused with Google Ads IDs

The sync pipeline now maps internal IDs correctly.

### D. Search term analyzer
A real first-pass analyzer exists for:
- search-term intent classification
- waste detection
- opportunity detection
- seller-situation tagging
- negative keyword suggestions
- landing-page opportunity signals

It was later hardened to reduce harmful outputs.

### E. Recommendation queue UI
A recommendation queue UI exists with:
- summary counts
- filters by market / risk / status / type
- recommendation cards
- Approve / Test / Ignore actions
- audit-aware persistence

It was hardened so the UI no longer lies about:
- mock vs live data
- failed actions
- degraded states

### F. Supabase live integration
Supabase is live enough for the current operator flow:
- schema applied
- recommendations stored
- approvals persisted
- proposal persistence added

### G. Google Ads read-only integration
A real read-only Google Ads integration now exists with:
- OAuth refresh
- REST API access
- manual sync script
- diagnostics

This proved the currently connected account contains:
- a PMax campaign
- no active Search campaign data yet

So the code path works, but the account still needs a live Search campaign before the analyzer can learn from real Search terms.

### H. Search campaign proposal system
A Spokane Search campaign proposal system exists with:
- structured proposal model
- proposal persistence
- review UI
- operator actions:
  - approve
  - request edits
  - reject

The proposal was then narrowed and hardened for a first real launch.

### I. `/sell` landing page
The first Spokane seller landing page exists at:
- `dominionhomedeals.com/sell`

It includes:
- form + call/text options
- Spokane-first copy
- local trust
- direct-buyer tone
- no-call-center positioning
- broad-enough invitation for likely-fit sellers

### J. Conversion tracking layer
A lightweight event layer now exists for:
- `generate_lead`
- `form_step`
- `click_to_call`

Tracking was refined so:
- Google Ads conversion labels come from env vars
- call intent is scoped properly
- form success cannot double-fire

---

## 11. Current live landing page state
### `/sell` page status
The Spokane seller landing page is built and considered **launch-ready for v1**.

### Key characteristics
- uses real Dominion site structure
- uses real LeadForm flow
- supports call, text, and form
- uses Spokane-first messaging
- uses direct-buyer / local trust language
- avoids overpromising timing

### CTA strategy
The site now emphasizes:
- **Call or Text 509-822-5460**
- **Get Your Cash Offer**

This better matches how real motivated sellers want to make contact.

### Current public-facing team language
The public site now consistently reflects:
- Adam and Logan
- local two-person team
- no call center
- direct communication

---

## 12. Current conversion tracking state
### Implemented in code
- `generate_lead` fires on successful form submission only
- `form_step` fires for form-step progression in GA4 only
- `click_to_call` fires for phone click intent
- Google Ads call conversion is scoped to `/sell`
- Google Ads conversion labels are read from env vars

### Still requires manual setup
#### In Google Ads
- create a lead form conversion action
- create a call intent conversion action
- copy both conversion labels
- set them in Vercel env vars
- redeploy after env vars are set

#### In GA4
- mark `generate_lead` as a key event
- mark `click_to_call` as a key event
- register custom dimensions for key parameters

---

## 13. Current Spokane Search campaign design
The initial manual build is a Spokane-first Search campaign with:
- Search only
- no Search Partners
- no Display Network
- Maximize Clicks
- $12 max CPC cap
- $30/day budget
- exact + phrase only
- no broad match in v1
- shared negative keyword list
- Presence-only geo targeting

### Four initial ad groups
1. Sell My House — Spokane
2. As-Is / Repairs — Spokane
3. Inherited / Probate — Spokane
4. Landlord Exit — Spokane

### Current launch philosophy
- narrow enough to avoid obvious waste
- broad enough to invite likely-fit sellers into conversation
- no full automation yet
- human approval before risky actions

---

## 14. What is still missing
### A. Final Google Ads conversion setup
Still needed manually:
- lead form conversion action
- call intent conversion action
- label placement in env vars
- redeploy
- platform-side verification

### B. Proposal approval
The Spokane campaign proposal still requires explicit operator approval before it should be treated as launch-ready.

### C. Manual campaign build
There is still **no Google Ads write/deployment layer**.
So the first Search campaign must still be built manually from the approved build sheet.

### D. Full lead persistence / CRM layer
Leads currently route through:
- form submission
- email
- SMS
- logs

But the full CRM-style lead storage layer is not yet the main operating center.
That is a likely Phase 2 priority.

### E. Auth and RLS
The system still needs:
- Supabase Auth
- real operator identity
- RLS policies
- safer production access control

### F. Real Search campaign data
The connected Google Ads account still needs a real Search campaign launched so the analyzer and operator system can begin learning from:
- keywords
- search terms
- CPCs
- conversion signals

---

## 15. Immediate next steps
### Current priority order
1. finish the last ad-copy corrections in the manual build sheet
2. create Google Ads conversion actions
3. set conversion labels in Vercel
4. redeploy DominionHomeDeals
5. test `/sell` form + call/text tracking in production
6. approve the Spokane campaign proposal
7. manually build the Spokane Search campaign in Google Ads
8. launch carefully and monitor for 7 days
9. sync real Search data into Dominion Ads once traffic starts flowing

---

## 16. Recommended 7-day post-launch monitoring plan
### Day 1
- launch campaign with $30/day budget
- check impressions, clicks, and ad approvals within a few hours
- check GA4 Realtime for `/sell` traffic and conversion events
- check Vercel logs for lead API errors or successful submissions
- check Google Ads search terms at end of day for obvious waste

### Days 2–3
- review search terms and add negatives quickly
- verify CPC range is reasonable
- verify ad groups are getting some distribution
- check whether `form_step` and `generate_lead` events are appearing
- measure response speed on any leads that came in

### Days 4–7
- expand negative keyword list based on real search term waste
- calculate first cost per lead
- review device performance
- verify geo quality
- summarize week-1 metrics and decisions

---

## 17. Known launch risks
### Risk 1: Thin budget
At $30/day, the campaign may only get 3–6 clicks/day at first. Learning will be slow.

### Risk 2: Call tracking is still intent-only
`click_to_call` captures click intent, not completed calls or call quality.

### Risk 3: New Search account with no conversion history
Maximize Clicks is the correct starting strategy, but Google has little to learn from yet.

### Risk 4: Negative keyword overblocking
The phrase negative `"how to"` may block some legit seller-intent informational searches. Watch search term quality closely.

### Risk 5: Leads are not yet fully stored in a true CRM layer
Current lead routing relies on email, SMS, and logs rather than a fully operational acquisitions database.

### Risk 6: Geo targeting misconfiguration can silently waste money
If the campaign is set to “Presence or interest” instead of “Presence,” budget can leak to irrelevant out-of-area searchers.

---

## 18. Available tools and data sources for future phases
Dominion already has or may have access to:
- Twilio
- ATTOM API
- PropertyRadar
- Spokane County records
- Kootenai County records

These should shape future architecture.

### Architectural guidance
- do not rebuild capabilities these tools already provide well
- prioritize Twilio for speed-to-lead and communication logging
- prioritize county / ATTOM / PropertyRadar data for property and owner enrichment
- keep the current build focused, but avoid dead-end architecture

---

## 19. What Phase 2 is intended to become
As soon as the current launch path is working, the next likely phase is an **acquisitions CRM layer**.

That would likely include:
- lead inbox
- lead status pipeline
- call outcome logging
- qualified-fit tracking
- appointment / offer / contract stages
- source attribution
- speed-to-lead monitoring

Longer term, because Dominion already has access to Twilio and property-data sources, the system can grow into a true wholesaling operating system rather than a simple ads dashboard.

---

## 20. Guiding principles going forward
1. Optimize for contracts, not clicks
2. Keep Spokane first
3. Stay local, seller-only, and situation-aware
4. Do not overcomplicate the system
5. Prefer truthful, reviewable workflows over clever automation
6. Use AI to save operator time, not create operator confusion
7. Build the next highest-value layer only after the current one works

---

## 21. Current state in one sentence
Dominion Ads is now a real, partially operational system with live proposal, landing page, tracking, recommendation, and sync foundations — and it is very close to supporting the first disciplined Spokane Search launch.

---

## 22. Best “resume work” prompt for a new ChatGPT conversation
Use this at the start of a new conversation:

> I’m working on Dominion Ads for Dominion Home Deals, a real estate wholesaling business focused first on Spokane County. Please treat the attached project status document as the current source of truth. The immediate goal is to launch the first Spokane Search campaign safely, measure real inbound, and then move into Phase 2 acquisitions CRM work. Read the document fully before recommending next steps.

