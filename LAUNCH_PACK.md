# Spokane Seller Search — Launch Pack

_Audit date: March 9, 2026_
_Repos audited: dominionhomedeals (consumer site), dominion-ads-ai (operator system)_
_Status doc audited: DOMINION_ADS_STATUS.md_

---

## A. Executive Verdict

### Is this ready for first Spokane Search launch?

**Almost. Two RSA descriptions are 1 character over the 90-char limit. Fix those, create conversion actions in Google Ads, set the env vars in Vercel, redeploy, and it is ready.**

### What is ready now

- `/sell` landing page — live, tested, Spokane-first copy, form + call/text CTAs
- 3-step `LeadForm` — UTM capture, TCPA/SMS compliance, honeypot, rate limiting
- Lead notification pipeline — email (Resend) to adam@ and logan@, SMS (Twilio) to two operator numbers
- GA4 + Google Ads scripts loading correctly in production
- Conversion tracking code — `generate_lead`, `form_step`, `click_to_call` all wired
- Conversion labels read from env vars — code is ready to receive them
- Campaign proposal — 4 ad groups, 32 keywords (exact + phrase only), 42 headlines, 16 descriptions, complete negative keyword list
- Status doc — accurate and aligned with code (minor exceptions listed below)

### What is NOT ready yet

| Item | Type | Blocker? |
|------|------|----------|
| 2 RSA descriptions over 90-char limit | Code fix | **Yes** |
| Google Ads conversion actions not created | Manual setup | **Yes** |
| Conversion label env vars not set in Vercel | Manual setup | **Yes** |
| Vercel redeploy after env vars | Manual step | **Yes** |
| Production event verification (GA4 Realtime + Tag Assistant) | Manual QA | **Yes** |
| Campaign manually built in Google Ads UI | Manual build | **Yes** |

### Smallest path to launch

1. Fix 2 over-limit RSA descriptions (code — 2 minutes)
2. Create 2 conversion actions in Google Ads (manual — 10 minutes)
3. Set `NEXT_PUBLIC_GADS_FORM_LABEL` and `NEXT_PUBLIC_GADS_CALL_LABEL` in Vercel (manual — 2 minutes)
4. Redeploy dominionhomedeals (Vercel — automatic on push, or manual trigger)
5. Verify events fire in GA4 Realtime + Google Tag Assistant (manual — 15 minutes)
6. Build campaign manually from build sheet below (manual — 45-60 minutes)
7. Launch

---

## B. Repo Consistency Findings

### Must Fix Before Launch

| # | Finding | Location | Detail |
|---|---------|----------|--------|
| 1 | **Seller Intent description 2 is 91 chars (limit 90)** | `spokane-seller-search.ts` line 168 | `We buy houses in any condition across Spokane. Close on your timeline. Call or text today.` — 91 chars. Fix: change "across Spokane" to "in Spokane" (saves 3 chars). |
| 2 | **As-Is description 1 is 91 chars (limit 90)** | `spokane-seller-search.ts` line 215 | `Don't spend thousands on repairs. We buy Spokane homes in any condition. Cash offer today.` — 91 chars. Fix: change "Cash offer today." to "Get a cash offer." or drop the period. |

### Should Fix Soon (Before or Shortly After Launch)

| # | Finding | Location | Detail |
|---|---------|----------|--------|
| 3 | **Duplicate file `route.ts.ts`** | `src/app/api/leads/route.ts.ts` | Old version with different email recipient (`offers@`) and different SMS recipient (`+15098225460`). Next.js ignores the `.ts.ts` extension so it doesn't affect routing, but it's a confusing artifact and a source of outdated information. **Delete it.** |
| 4 | **Duplicate LocalBusiness JSON-LD** | `layout.tsx` lines 61-108 + `structured-data.tsx` lines 1-42 | `layout.tsx` renders a `<JsonLd>` component in `<head>` with LocalBusiness + WebSite schema. Then it also renders `<LocalBusinessSchema />` from `structured-data.tsx` in `<body>`. This produces **two** LocalBusiness schema blocks on every page. Search engines may flag duplicate structured data. Remove one — keep the `structured-data.tsx` version (it's more complete with `email`, `priceRange`, `sameAs`). |
| 5 | **Hardcoded SMS recipients** | `route.ts` line 177 | `['+15095907091', '+15096669518']` — these should ideally be env vars (`NOTIFICATION_SMS_NUMBERS` or similar). Hardcoded numbers mean a code change + redeploy to update. Not blocking, but fragile. |
| 6 | **Hardcoded email recipients** | `route.ts` line 142 | `['adam@dominionhomedeals.com', 'logan@dominionhomedeals.com']` — same concern. Should be env var for production flexibility. |
| 7 | **API response says "24 hours" but form UI says "15 minutes"** | `route.ts` line 289 vs `LeadForm.tsx` line 215 | The API returns `message: 'Thank you! One of our team members will reach out within 24 hours.'` but the LeadForm success UI hardcodes "will reach out within 15 minutes." The API message is never shown to users (LeadForm uses its own UI), so this is cosmetically inconsistent, not user-facing. Align them. |
| 8 | **Inline char-count comments in proposal are wrong for several headlines** | `spokane-seller-search.ts` various lines | Example: comment says `'Sell Your Spokane House Fast' // 27` but actual count is 28. Comment says `'Local Spokane Home Buyer' // 24` but actual count is 25. Comments are decorative, not functional, but they mislead during manual review. |
| 9 | **Max CPC cap ($12) only exists in code comments, not in proposal data** | `spokane-seller-search.ts` header comments | The `CampaignProposal` type has no `max_cpc_cap` field. The $12 cap is mentioned in the v2 header comments and in the status doc, but it's not in the generated proposal object. The build sheet operator must know to set this manually. |
| 10 | **Phone number hardcoded in LeadForm error messages** | `LeadForm.tsx` lines 193, 197 | Error fallbacks say `Please call us at 509-822-5460` as raw strings instead of using `SITE.phone`. Works fine, but if the number ever changes again, these would be missed. |

### Safe to Ignore for Now

| # | Finding | Location | Detail |
|---|---------|----------|--------|
| 11 | **SMS opt-in pre-checked** | `LeadForm.tsx` line 50 | `smsOptIn: true` as initial state. The checkbox slides in only after 4+ phone digits and is clearly labeled. Users can uncheck. This is common UX practice and within TCPA/10DLC norms since submitting the form is the consent action. Monitor carrier deliverability. |
| 12 | **Rate limiting is in-memory** | `route.ts` line 47 | `rateLimitMap` is a `Map<>` in serverless memory. On Vercel, each cold start resets the map. Effective against rapid-fire bots but won't survive across function instances. Sufficient for launch volume. |
| 13 | **No `ad_schedule` or `geo_targeting` fields in proposal data structure** | `campaign-proposals.ts` | These are mentioned in the `assumptions` array as text, not as structured data. The operator must read the assumptions and configure them manually. Acceptable for a first manual build. |
| 14 | **`sameAs: []` in structured data** | `structured-data.tsx` line 33 | Empty social links array. Not harmful, just incomplete. Add social profiles when they exist. |
| 15 | **`@type: 'County'` in structured data** | `structured-data.tsx` line 23 | `County` is not a standard Schema.org type. `AdministrativeArea` (used in `layout.tsx`) is correct. The `structured-data.tsx` version should use `AdministrativeArea`. Low priority — Google is lenient on area types. |

### Status Doc vs Code Discrepancies

| Status Doc Claim | Actual State | Severity |
|-----------------|-------------|----------|
| §15 item 1: "finish the last ad-copy corrections" | 2 descriptions still over 90-char limit | **Must fix** |
| §6: "Adam or Logan call back in under 1 hour" / Target: "under 10 minutes" | LeadForm success says "15 minutes," API says "24 hours" | Cosmetic mismatch |
| §13: "exact + phrase only" | Confirmed — 18 exact, 14 phrase, 0 broad | ✅ Accurate |
| §13: "$12 max CPC cap" | Not in proposal data structure, only in comments | Operator must set manually |
| §13: "Presence-only geo targeting" | Not in proposal data, mentioned in assumptions text | Operator must set manually |
| §12: "Google Ads conversion labels come from env vars" | Confirmed in code | ✅ Accurate |
| §11: "Call or Text 509-822-5460" | Confirmed in all CTAs on /sell and site-wide | ✅ Accurate |
| §10: "Proposal persistence added" | Confirmed — `database/queries/proposals.ts` + API route exist | ✅ Accurate |
| §10: "Conversion tracking layer" | Confirmed — `tracking.ts` + `analytics.tsx` + `LeadForm.tsx` | ✅ Accurate |

---

## C. Final Launch Checklist

Execute in this exact order.

### Phase 1: Code Fixes (5 minutes)

- [ ] Fix Seller Intent description 2 — change "across Spokane" to "in Spokane" (or equivalent ≤90 chars)
- [ ] Fix As-Is description 1 — trim 1 character (or equivalent ≤90 chars)
- [ ] Commit and push to main
- [ ] Verify build succeeds

### Phase 2: Google Ads Conversion Setup (15 minutes)

- [ ] Log into Google Ads account `AW-17965617200`
- [ ] Go to **Goals → Conversions → New conversion action → Website**
- [ ] Create conversion action #1: **"Lead Form"**
  - Category: Submit lead form
  - Value: Use the same value for each conversion → $1.00
  - Count: One conversion per click
  - Click-through window: 30 days
  - View-through window: 1 day
  - Attribution: Data-driven (or Last click if data-driven unavailable)
- [ ] Copy the **conversion label** (looks like `AbCdEfGhIjKlMn`)
- [ ] Create conversion action #2: **"Call Intent"**
  - Category: Phone call leads
  - Value: $1.00
  - Count: One
  - Same windows as above
- [ ] Copy the **conversion label**

### Phase 3: Environment Variables (5 minutes)

- [ ] Go to Vercel → dominionhomedeals project → Settings → Environment Variables
- [ ] Set `NEXT_PUBLIC_GADS_FORM_LABEL` = Lead Form conversion label
- [ ] Set `NEXT_PUBLIC_GADS_CALL_LABEL` = Call Intent conversion label
- [ ] Verify `RESEND_API_KEY` is set (email notifications)
- [ ] Verify `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` are set (SMS notifications)

### Phase 4: Redeploy (5 minutes)

- [ ] Trigger redeploy in Vercel (or push any commit to trigger automatic deploy)
- [ ] Wait for deploy to complete
- [ ] Verify site loads at `dominionhomedeals.com/sell`

### Phase 5: Production Event Testing (20 minutes)

- [ ] Open GA4 → Realtime report
- [ ] Open Google Tag Assistant in Chrome → connect to `dominionhomedeals.com/sell`
- [ ] Navigate to `/sell`
- [ ] Click a `tel:` link → verify `click_to_call` event appears in GA4 Realtime
- [ ] Verify Google Ads `conversion` event fires in Tag Assistant (only on `/sell`)
- [ ] Fill out the lead form (use test data)
  - Step 1 → verify `form_step` (step 2) fires in GA4
  - Step 2 → verify `form_step` (step 3) fires in GA4
  - Submit → verify `generate_lead` fires in GA4
  - Verify Google Ads `conversion` event fires in Tag Assistant
- [ ] Check email — did adam@ and logan@ receive the lead notification?
- [ ] Check SMS — did both operator numbers receive the SMS?
- [ ] Check Vercel logs — is `[NEW LEAD]` logged?
- [ ] Submit form again immediately → verify rate limiter doesn't trigger on second submission within reason
- [ ] Test with UTM params: `/sell?utm_source=google&utm_medium=cpc&utm_campaign=spokane_seller_search` → verify UTMs appear in the lead notification email

### Phase 6: GA4 Configuration (10 minutes)

- [ ] In GA4 → Admin → Events → find `generate_lead` → mark as **Key Event**
- [ ] In GA4 → Admin → Events → find `click_to_call` → mark as **Key Event**
- [ ] In GA4 → Admin → Custom definitions → create custom dimensions:
  - `landing_page` (event-scoped)
  - `utm_source` (event-scoped)
  - `property_city` (event-scoped)
  - `seller_timeline` (event-scoped)
  - `cta_location` (event-scoped)

### Phase 7: Campaign Build (45-60 minutes)

- [ ] Build campaign from the build sheet in Section D below
- [ ] Double-check: **Presence only** (not Presence or interest) for geo targeting
- [ ] Double-check: **Search Network only** (no Display, no Search Partners)
- [ ] Double-check: Max CPC bid limit = **$12**
- [ ] Double-check: All 4 ad groups have final URL = `https://dominionhomedeals.com/sell`
- [ ] Preview ads in Google Ads Editor or campaign preview tool

### Phase 8: Launch (5 minutes)

- [ ] Enable campaign
- [ ] Check for ad disapprovals within 1 hour
- [ ] Verify impressions are flowing within 2-3 hours

### Phase 9: Day-1 Monitoring

- [ ] Follow the monitoring SOP in Section F

---

## D. Final Spokane Search Campaign Build Sheet

### Campaign Settings

| Setting | Value |
|---------|-------|
| Campaign name | `Spokane \| Seller Search \| Dominion` |
| Campaign type | Search |
| Networks | Search Network only — **uncheck** Search Partners, **uncheck** Display Network |
| Goal | Leads |
| Bidding | Maximize Clicks |
| Max CPC bid limit | $12.00 |
| Daily budget | $30.00 |
| Start date | Launch day |
| End date | None |
| Campaign URL options | None (UTMs set in final URLs via Google's auto-tagging / `gclid`) |

### Geographic Targeting

| Setting | Value |
|---------|-------|
| Locations | Spokane County, WA + 15-mile radius |
| Location options | **Presence: People in or regularly in your targeted locations** |
| Exclusions | None initially |

**Critical:** Do NOT use "Presence or interest" — this will leak budget to out-of-area searchers.

### Ad Schedule

| Setting | Value |
|---------|-------|
| Days | All 7 days |
| Hours | 6:00 AM – 10:00 PM Pacific |

### Languages

| Setting | Value |
|---------|-------|
| Language | English |

---

### Ad Group 1: Sell My House — Spokane

**Theme:** Core seller intent + urgency situations

#### Keywords (13 total: 8 exact, 5 phrase)

| Keyword | Match Type |
|---------|------------|
| `[sell my house fast spokane]` | Exact |
| `[sell my house spokane]` | Exact |
| `[we buy houses spokane]` | Exact |
| `[cash home buyers spokane]` | Exact |
| `[sell house for cash spokane]` | Exact |
| `[need to sell house quickly spokane]` | Exact |
| `[sell house before foreclosure]` | Exact |
| `[sell house during divorce]` | Exact |
| `"sell my house fast"` | Phrase |
| `"we buy houses"` | Phrase |
| `"cash home buyer"` | Phrase |
| `"sell house without realtor"` | Phrase |
| `"sell house fast for cash"` | Phrase |

#### RSA — Headlines (12)

| # | Headline | Chars |
|---|----------|-------|
| 1 | Sell Your Spokane House Fast | 28 |
| 2 | Fast Local Cash Offer | 22 |
| 3 | We Buy Houses in Spokane | 25 |
| 4 | No Repairs Needed | 18 |
| 5 | Skip the Realtor Fees | 22 |
| 6 | Close in As Few As 7 Days | 26 |
| 7 | Local Spokane Home Buyer | 25 |
| 8 | Get Your Free Cash Offer | 25 |
| 9 | No Commissions or Fees | 23 |
| 10 | Dominion Homes | 15 |
| 11 | Fair Cash Offer Today | 22 |
| 12 | Your Timeline, Your Terms | 26 |

#### RSA — Descriptions (4)

| # | Description | Chars |
|---|-------------|-------|
| 1 | Get a fair cash offer for your Spokane home. No repairs, no fees, close on your terms. | 88 |
| 2 | We buy houses in any condition in Spokane. Close on your timeline. Call or text today. | **87** ← _after fix_ |
| 3 | Need to sell fast? We close in as few as 7 days. No commissions, no inspections required. | 90 |
| 4 | Facing foreclosure or divorce? Local Spokane buyer makes fair cash offers. Call or text. | 89 |

**Final URL:** `https://dominionhomedeals.com/sell`
**Display path:** `dominionhomedeals.com/Sell-House/Spokane`

---

### Ad Group 2: As-Is / Repairs — Spokane

**Theme:** Property condition — sellers with damaged/neglected homes

#### Keywords (7 total: 4 exact, 3 phrase)

| Keyword | Match Type |
|---------|------------|
| `[sell house as is spokane]` | Exact |
| `[sell damaged house spokane]` | Exact |
| `[sell house needing repairs spokane]` | Exact |
| `[sell fixer upper spokane]` | Exact |
| `"sell house as is"` | Phrase |
| `"sell damaged property"` | Phrase |
| `"sell house needing repairs"` | Phrase |

#### RSA — Headlines (10)

| # | Headline | Chars |
|---|----------|-------|
| 1 | Sell Your House As-Is | 22 |
| 2 | No Repairs Required | 20 |
| 3 | We Buy Damaged Homes | 21 |
| 4 | Any Condition, Cash Offer | 26 |
| 5 | Sell Your Fixer Upper Fast | 27 |
| 6 | Cash for As-Is Homes | 21 |
| 7 | Skip Costly Repairs | 20 |
| 8 | Fair Offer, Any Condition | 26 |
| 9 | Local Spokane Cash Buyer | 25 |
| 10 | No Inspections Needed | 22 |

#### RSA — Descriptions (4)

| # | Description | Chars |
|---|-------------|-------|
| 1 | Don't spend thousands on repairs. We buy Spokane homes in any condition. Get a cash offer. | **90** ← _after fix_ |
| 2 | Foundation, mold, or major damage? We buy it as-is. No repairs, no inspections required. | 89 |
| 3 | Your fixer upper is worth cash today. We buy homes in any condition in Spokane County. | 87 |
| 4 | Stop worrying about costly repairs. Get a fair cash offer for your as-is property now. | 87 |

**Final URL:** `https://dominionhomedeals.com/sell`
**Display path:** `dominionhomedeals.com/Sell-As-Is/Spokane`

---

### Ad Group 3: Inherited / Probate — Spokane

**Theme:** Estate/inheritance situations — heirs and executors

#### Keywords (6 total: 3 exact, 3 phrase)

| Keyword | Match Type |
|---------|------------|
| `[sell inherited house spokane]` | Exact |
| `[sell probate house spokane]` | Exact |
| `[sell inherited property]` | Exact |
| `"sell inherited house"` | Phrase |
| `"sell probate property"` | Phrase |
| `"inherited property sale"` | Phrase |

#### RSA — Headlines (10)

| # | Headline | Chars |
|---|----------|-------|
| 1 | Sell Your Inherited Home | 25 |
| 2 | Probate Property? We Buy It | 28 |
| 3 | Inherited a House? | 19 |
| 4 | Cash Offer for Inherited Home | 30 |
| 5 | We Handle Probate Sales | 24 |
| 6 | No Cleanup Required | 20 |
| 7 | Settle the Estate Quickly | 26 |
| 8 | Get a Fair Cash Offer | 22 |
| 9 | Local Spokane Buyer | 20 |
| 10 | Close on Your Timeline | 23 |

#### RSA — Descriptions (4)

| # | Description | Chars |
|---|-------------|-------|
| 1 | Inherited a property in Spokane? We buy inherited homes for cash. No cleanup, no repairs. | 90 |
| 2 | Dealing with probate? We make selling estate properties simple. Fast cash offer today. | 87 |
| 3 | Out-of-state heir? We handle everything locally. Fast cash offer for your inherited home. | 90 |
| 4 | Settling an estate shouldn't be stressful. We buy probate properties in any condition. | 87 |

**Final URL:** `https://dominionhomedeals.com/sell`
**Display path:** `dominionhomedeals.com/Inherited-Home/Sell`

---

### Ad Group 4: Landlord Exit — Spokane

**Theme:** Tired landlords and rental property owners

#### Keywords (6 total: 3 exact, 3 phrase)

| Keyword | Match Type |
|---------|------------|
| `[sell rental property spokane]` | Exact |
| `[sell house with tenants spokane]` | Exact |
| `[tired landlord sell property]` | Exact |
| `"sell rental property"` | Phrase |
| `"sell house with tenants"` | Phrase |
| `"tired of being landlord"` | Phrase |

#### RSA — Headlines (10)

| # | Headline | Chars |
|---|----------|-------|
| 1 | Tired of Being a Landlord? | 27 |
| 2 | Sell Your Rental Property | 26 |
| 3 | We Buy With Tenants In Place | 29 |
| 4 | Problem Tenants? Sell Now | 25 |
| 5 | Cash for Rental Properties | 27 |
| 6 | Done With Property Mgmt? | 25 |
| 7 | No Tenant Eviction Needed | 26 |
| 8 | Local Spokane Buyer | 20 |
| 9 | Fair Cash Offer Today | 22 |
| 10 | End Landlord Headaches | 23 |

#### RSA — Descriptions (4)

| # | Description | Chars |
|---|-------------|-------|
| 1 | Tired of chasing rent? We buy Spokane rentals with tenants in place. No eviction needed. | 89 |
| 2 | Done with property management? Get a fair cash offer for your rental property today. | 85 |
| 3 | Problem tenants making life difficult? Sell your rental property as-is. Call or text us. | 89 |
| 4 | Exit your rental on your terms. We buy landlord properties in any condition in Spokane. | 88 |

**Final URL:** `https://dominionhomedeals.com/sell`
**Display path:** `dominionhomedeals.com/Sell-Rental/Spokane`

---

### Shared Negative Keywords (Campaign Level)

Apply as a **shared negative keyword list** named `Spokane Seller Search — Negatives`.

#### Realtor/Agent Traffic

| Negative | Match Type |
|----------|------------|
| realtor | Broad |
| "real estate agent" | Phrase |
| "listing agent" | Phrase |
| "real estate broker" | Phrase |
| "MLS listing" | Phrase |

#### Buyer Traffic

| Negative | Match Type |
|----------|------------|
| "buy a house" | Phrase |
| "houses for sale" | Phrase |
| "homes for sale" | Phrase |
| "home for sale" | Phrase |
| zillow | Broad |
| redfin | Broad |
| trulia | Broad |

#### Renter Traffic

| Negative | Match Type |
|----------|------------|
| "for rent" | Phrase |
| "apartment for rent" | Phrase |
| "lease agreement" | Phrase |

#### Job/Career Traffic

| Negative | Match Type |
|----------|------------|
| "real estate job" | Phrase |
| "real estate career" | Phrase |
| "real estate license" | Phrase |

#### Commercial/Land

| Negative | Match Type |
|----------|------------|
| "commercial property" | Phrase |
| "land for sale" | Phrase |
| "vacant lot" | Phrase |

#### Valuation Lookups

| Negative | Match Type |
|----------|------------|
| "home value" | Phrase |
| "property value" | Phrase |
| "how much is my house worth" | Phrase |

#### Wholesaling/Investor Traffic

| Negative | Match Type |
|----------|------------|
| wholesaling | Broad |
| "wholesale houses" | Phrase |
| "flip houses" | Phrase |
| "real estate investing" | Phrase |
| "real estate course" | Phrase |

#### Informational Intent

| Negative | Match Type |
|----------|------------|
| "how to" | Phrase |
| free | Broad |

**Total: 28 negative keywords** (5 broad, 23 phrase)

---

### Extensions / Assets

| Asset Type | Value |
|-----------|-------|
| Sitelink 1 | "How It Works" → `https://dominionhomedeals.com/how-we-work` |
| Sitelink 2 | "About Our Team" → `https://dominionhomedeals.com/about` |
| Sitelink 3 | "Areas We Serve" → `https://dominionhomedeals.com/neighborhoods` |
| Call asset | `509-822-5460` (show during ad schedule hours only) |
| Callout 1 | No Commissions |
| Callout 2 | No Repairs Needed |
| Callout 3 | Close in 2 Weeks |
| Callout 4 | Local Spokane Team |
| Structured snippet | Types: Cash Offer, As-Is Purchase, Probate Sale, Rental Purchase |

---

## E. Final Production QA Checklist for `/sell`

### Form Submission

- [ ] Fill out all 3 steps with valid test data → submit succeeds
- [ ] Verify success message shows "Adam or Logan — will reach out within 15 minutes"
- [ ] Verify `landingPage` field in the lead notification = `/sell`
- [ ] Submit with empty required fields → validation blocks submission
- [ ] Submit with invalid phone (5 digits) → validation blocks
- [ ] Submit with invalid email (no @) → validation blocks
- [ ] Fill honeypot field → form "succeeds" silently (no lead notification sent)

### Email Notification

- [ ] Lead notification arrives at `adam@dominionhomedeals.com`
- [ ] Lead notification arrives at `logan@dominionhomedeals.com`
- [ ] Email contains: name, phone (clickable), email, address, city/state/zip, condition, timeline
- [ ] Email contains: TCPA consent timestamp, IP, UTM data
- [ ] Priority label is correct (URGENT for ASAP, SOON for Soon, NORMAL for others)

### SMS Notification

- [ ] SMS arrives at `+15095907091`
- [ ] SMS arrives at `+15096669518`
- [ ] SMS contains: name, address, phone, condition, timeline
- [ ] SMS says "Call them back ASAP!"

### GA4 Event Validation

- [ ] Open GA4 → Realtime → Event count
- [ ] Navigate to `/sell` → `page_view` appears
- [ ] Click through form steps → `form_step` events appear (step 2, step 3)
- [ ] Submit form → `generate_lead` event appears
- [ ] Click any `tel:` link on `/sell` → `click_to_call` event appears
- [ ] Click a `tel:` link on a non-/sell page → `click_to_call` appears but NO Google Ads conversion

### Google Ads Conversion Validation

- [ ] Install Google Tag Assistant → connect to `dominionhomedeals.com/sell`
- [ ] Submit form → verify `conversion` tag fires with correct `send_to` (AW-17965617200/{FORM_LABEL})
- [ ] Click `tel:` link on `/sell` → verify `conversion` tag fires with correct `send_to` (AW-17965617200/{CALL_LABEL})
- [ ] Click `tel:` link on homepage → verify NO Google Ads conversion fires (GA4 only)

### Tel: Click Validation

- [ ] Hero phone CTA clicks → `click_to_call` fires with `cta_location: 'page'` or section id
- [ ] Header phone link → `cta_location: 'header'`
- [ ] Footer phone link → `cta_location: 'footer'`
- [ ] Mobile: tel: link opens phone dialer

### UTM Capture Validation

- [ ] Navigate to `/sell?utm_source=google&utm_medium=cpc&utm_campaign=spokane_seller_search&utm_term=sell+my+house+fast`
- [ ] Submit form
- [ ] Verify lead notification email contains all 4 UTM values
- [ ] Verify `generate_lead` event in GA4 contains UTM params

### Spam / Honeypot / Rate Limit

- [ ] Submit with honeypot filled → returns success silently, no lead notification
- [ ] Submit 6+ times rapidly from same IP → 429 rate limit response on 6th
- [ ] Verify Vercel logs show `[SPAM]` for honeypot triggers

### Page Quality

- [ ] Page loads in under 2 seconds (run Lighthouse or PageSpeed Insights)
- [ ] Mobile responsive at 375px width — form is usable, CTAs are tappable
- [ ] All scroll animations (FadeIn) work smoothly
- [ ] No console errors on page load
- [ ] No broken images or missing fonts

---

## F. Monitoring SOP — Days 1–7

### Day 1 (Launch Day)

**Check within 2 hours of launch:**

| Check | Where | Action Trigger |
|-------|-------|----------------|
| Ads approved? | Google Ads → Ads & extensions | If disapproved: fix copy and resubmit immediately |
| Impressions flowing? | Google Ads → Campaigns overview | If zero after 3 hours: check geo, schedule, budget, bidding |
| Clicks happening? | Google Ads → Campaigns overview | If zero clicks after 6 hours with impressions: check ad copy relevance |
| GA4 seeing /sell traffic? | GA4 → Realtime → Pages | If no traffic: check final URLs are correct |
| Geo correct? | Google Ads → Locations report | If clicks from outside Spokane: verify "Presence only" setting |

**Check at end of day 1:**

| Check | Where | Action Trigger |
|-------|-------|----------------|
| Search terms clean? | Google Ads → Search terms report | Add negatives for any clearly irrelevant terms |
| CPC range? | Google Ads → Keywords | If avg CPC > $15: consider lowering max CPC cap |
| Any leads? | Email/SMS | If yes: track response time. Verify lead data quality |
| Any form_step events? | GA4 → Events | If form_step but no generate_lead: people are starting but not finishing |
| Conversion tag firing? | Google Ads → Conversions | If no conversion data: re-check env vars and Tag Assistant |
| Vercel errors? | Vercel → Logs | If API errors: investigate immediately |

### Days 2–3

| Check | Frequency | Action Trigger |
|-------|-----------|----------------|
| Search terms | Daily | Add negatives for waste. Document new negatives in a log |
| CPC by ad group | Daily | If one group is > 2x others: check keyword competition |
| Ad group distribution | Daily | If one group gets 0 impressions: check keyword status |
| Click-through rate | Daily | Below 3%: ad copy may not be matching search intent |
| form_step funnel | Daily | If step 1→2 drops > 60%: form UX issue on mobile? |
| generate_lead count | Daily | If 0 leads after $60+ spend: check form, check landing page |
| Response speed | Per lead | Target < 10 min. If > 1 hour: process problem |
| Device split | Once | If mobile > 70% with low conversion: check mobile form UX |

### Days 4–7

| Check | Frequency | Action Trigger |
|-------|-----------|----------------|
| Cost per lead (CPL) | Calculate on day 5+ | Divide total spend by total form submissions |
| Geo quality | Day 5 | Check locations report. Add geo exclusions if needed |
| Negative keyword expansion | Day 5 | Bulk review search terms, add new negatives |
| Ad group keyword status | Day 5 | Check for "low search volume" keywords. Pause if stuck |
| Week 1 summary | Day 7 | Document: spend, clicks, impressions, CTR, avg CPC, leads, CPL, search term quality, negatives added, response times |

### Key Metrics to Track Week 1

| Metric | Healthy Range | Concern Range |
|--------|--------------|---------------|
| Avg CPC | $5–12 | > $15 |
| CTR | 3–8% | < 2% |
| Daily spend | $25–35 | < $15 (not spending budget) |
| Impressions/day | 20–100 | < 10 |
| Clicks/day | 3–8 | < 2 |
| Form starts (form_step events) | ≥ 1/day after day 2 | 0 after $100 spend |
| Leads (generate_lead) | ≥ 1 by day 5 | 0 after $150 spend |
| Response time | < 10 min | > 1 hour |
| Search term waste | < 30% of clicks | > 50% of clicks |

### What Should Trigger Immediate Action

| Signal | Action |
|--------|--------|
| All ads disapproved | Fix flagged copy. Resubmit. Do not pause campaign |
| Geo leakage (clicks outside Spokane area) | Switch to "Presence only" if not already. Add geo exclusions |
| CPC spikes > $20 | Lower max CPC cap from $12 to $8. Add more negatives |
| Zero conversions after $200 spend | Test form submission manually. Check conversion tag. Check if landing page is actually loading |
| Obvious bot/spam leads | Check honeypot logs. Tighten rate limiting if needed |
| SMS/email not delivering | Check Twilio/Resend dashboards. Verify API keys |

---

## G. Minimal Next Code/Docs Tasks After Launch

Only after traffic starts flowing. Ordered by value.

| # | Task | Why | Effort |
|---|------|-----|--------|
| 1 | **Delete `route.ts.ts`** | Dead file with stale config. Confusing for anyone reading the repo | 1 min |
| 2 | **Fix duplicate LocalBusiness JSON-LD** | Remove the `<JsonLd>` block from `layout.tsx` (keep the one in `structured-data.tsx`) | 5 min |
| 3 | **Move SMS/email recipients to env vars** | Hardcoded phone numbers and emails in `route.ts` should be `NOTIFICATION_EMAILS` and `NOTIFICATION_SMS` env vars | 15 min |
| 4 | **Fix `@type: 'County'` → `'AdministrativeArea'`** in `structured-data.tsx` | Correct Schema.org type | 2 min |
| 5 | **Align API response time message** | Change `route.ts` line 289 from "24 hours" to "15 minutes" (or remove — it's unused) | 1 min |
| 6 | **Update inline char-count comments** in `spokane-seller-search.ts` | Wrong counts on several headlines cause confusion during manual review | 10 min |
| 7 | **Add `max_cpc_cap` and `ad_schedule` fields** to `CampaignProposal` type | Currently these only exist in comments/assumptions text, not structured data | 15 min |
| 8 | **Sync first week's search term data** into Dominion Ads | Run the Google Ads sync script after 7 days to pull real search term data into the analyzer | 30 min |
| 9 | **Update DOMINION_ADS_STATUS.md** after launch | Reflect actual launch date, early metrics, decisions made | 15 min |

**Do not start Phase 2 CRM work until week-1 data proves the campaign is generating real inbound.**
