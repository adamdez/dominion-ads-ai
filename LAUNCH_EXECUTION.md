# Spokane Seller Search — Launch Execution Sequence

_Generated: March 9, 2026_
_Controlling document: LAUNCH_PACK.md_
_Current state: All code work complete. Both repos clean and pushed._

---

## A. Remaining Actions by Priority

### MUST DO BEFORE LAUNCH (6 items — all manual/platform)

| # | Action | Where | Who | Est. Time |
|---|--------|-------|-----|-----------|
| 1 | Create "Lead Form" conversion action | Google Ads UI | You | 5 min |
| 2 | Create "Call Intent" conversion action | Google Ads UI | You | 5 min |
| 3 | Set conversion label env vars + verify Twilio/Resend vars | Vercel dashboard | You | 5 min |
| 4 | Redeploy dominionhomedeals | Vercel dashboard | You | 3 min |
| 5 | Production event verification | Browser + GA4 + Tag Assistant | You | 20 min |
| 6 | Build campaign from build sheet | Google Ads UI | You | 45-60 min |

**Total remaining time to launch: ~90 minutes of your hands-on work.**

### DO IMMEDIATELY AFTER LAUNCH (3 items — within first hour)

| # | Action | Where | Who | Est. Time |
|---|--------|-------|-----|-----------|
| 7 | Mark `generate_lead` and `click_to_call` as Key Events | GA4 Admin | You | 5 min |
| 8 | Create GA4 custom dimensions (5) | GA4 Admin | You | 5 min |
| 9 | Check ad approvals + first impressions | Google Ads UI | You | 5 min |

### DEFER UNTIL AFTER FIRST LIVE DATA (9 items — code cleanup)

| # | Action | Who | When |
|---|--------|-----|------|
| 10 | Delete `route.ts.ts` | Claude/code | After launch confirmed working |
| 11 | Fix duplicate LocalBusiness JSON-LD | Claude/code | After launch confirmed working |
| 12 | Move SMS/email recipients to env vars | Claude/code | Before next notification config change |
| 13 | Fix `@type: 'County'` in structured data | Claude/code | Anytime |
| 14 | Align API response time message | Claude/code | Anytime |
| 15 | Update inline char-count comments | Claude/code | Anytime |
| 16 | Add `max_cpc_cap`/`ad_schedule` to proposal type | Claude/code | When proposal system evolves |
| 17 | Sync week-1 search term data into Dominion Ads | Claude/code + You | Day 7-8 |
| 18 | Update DOMINION_ADS_STATUS.md | Claude/code | Day 7-8 |

---

## B. Exact Ordered Execution Checklist

Everything below is sequential. Do not skip ahead. Each step has a clear success signal and a blocker condition.

---

### STEP 1: Create Google Ads Conversion Actions

**Where:** Google Ads UI → account `AW-17965617200`
**Who:** You
**Time:** 10 minutes

#### 1a. Create "Lead Form" conversion

1. Google Ads → Goals → Conversions → + New conversion action → Website
2. Settings:
   - Name: `Lead Form`
   - Category: Submit lead form
   - Value: Same value each conversion → `$1.00` / `USD`
   - Count: One conversion per click
   - Click-through window: 30 days
   - View-through window: 1 day
   - Attribution: Data-driven (or Last click if unavailable)
3. On the tag setup screen, choose "Use an existing tag" (gtag.js already loaded)
4. Copy the **conversion label** — it looks like `AbCdEfGhIjKlMn`
5. Write it down or paste it somewhere accessible

**Success:** Conversion action appears in your Conversions list as "Lead Form" with status "Unverified" (expected — no events fired yet).
**Blocker:** Cannot access Google Ads account → fix account access first.

#### 1b. Create "Call Intent" conversion

1. Same flow as above
2. Settings:
   - Name: `Call Intent`
   - Category: Phone call leads
   - Value: `$1.00` / `USD`
   - Count: One
   - Same windows
3. Copy the **conversion label**

**Success:** Two conversion actions visible — "Lead Form" and "Call Intent," both "Unverified."
**Blocker:** None (same access as 1a).

---

### STEP 2: Set Environment Variables in Vercel

**Where:** Vercel → dominionhomedeals project → Settings → Environment Variables
**Who:** You
**Time:** 5 minutes

1. Set `NEXT_PUBLIC_GADS_FORM_LABEL` = the Lead Form conversion label from Step 1a
2. Set `NEXT_PUBLIC_GADS_CALL_LABEL` = the Call Intent conversion label from Step 1b
3. Apply to: Production, Preview, Development (all environments)
4. While you are here, confirm these are also set:
   - `RESEND_API_KEY` — required for email notifications
   - `TWILIO_ACCOUNT_SID` — required for SMS
   - `TWILIO_AUTH_TOKEN` — required for SMS
   - `TWILIO_PHONE_NUMBER` — required for SMS

**Success:** All 6 env vars show as set in the Vercel Environment Variables panel.
**Blocker:** If `RESEND_API_KEY` is missing → email notifications will silently skip. Not a launch blocker for ads, but you won't get lead emails. Set it before testing.
**Blocker:** If any Twilio var is missing → SMS notifications will silently skip. Same logic.

---

### STEP 3: Redeploy

**Where:** Vercel dashboard
**Who:** You
**Time:** 3 minutes

1. Go to Vercel → dominionhomedeals → Deployments
2. Click the three-dot menu on the latest Production deployment → Redeploy
   - **Important:** Check "Use existing Build Cache" is OFF (you need the new env vars baked in — `NEXT_PUBLIC_*` vars are inlined at build time)
3. Wait for deployment to complete (typically under 2 minutes)
4. Visit `https://dominionhomedeals.com/sell` — confirm the page loads normally

**Success:** `/sell` page loads. No visual changes expected — the conversion labels are used internally by JavaScript, not visible on the page.
**Blocker:** Build failure → check Vercel build logs. The last push built clean locally, so this is unlikely.

---

### STEP 4: Production Event Verification

**Where:** Browser (Chrome) + GA4 Realtime + Google Tag Assistant
**Who:** You
**Time:** 20 minutes

This is the critical pre-launch QA. Do not skip any sub-step.

#### 4a. Set up verification tools

1. Open Chrome → install Google Tag Assistant (Legacy) extension if not already installed
2. Open GA4 → Realtime report in a separate tab
3. Navigate to `https://dominionhomedeals.com/sell`

#### 4b. Test click-to-call tracking

1. Click the phone number link in the hero section of `/sell`
2. **In GA4 Realtime:** Look for `click_to_call` event within 5-10 seconds
3. **In Tag Assistant:** Look for a `conversion` event firing with `send_to` containing your Call Intent label

**Success:** Both GA4 event and Google Ads conversion fire.
**Failure diagnostic:** If GA4 event fires but no Google Ads conversion → the `NEXT_PUBLIC_GADS_CALL_LABEL` env var wasn't baked into the build. Re-check Vercel env vars and redeploy without cache.

#### 4c. Test form submission tracking

1. Fill out the form on `/sell` with test data:
   - Address: `123 Test St`
   - City: `Spokane`
   - State: WA
   - ZIP: `99201`
   - Condition: Needs Work
   - Timeline: Soon
   - First: `Test`
   - Last: `Lead`
   - Phone: `(509) 555-0100`
   - Email: `test@dominionhomedeals.com`
2. Click through step 1 → check GA4 Realtime for `form_step` (step_number: 2)
3. Click through step 2 → check GA4 Realtime for `form_step` (step_number: 3)
4. Submit → check for:
   - `generate_lead` in GA4 Realtime
   - Google Ads `conversion` event in Tag Assistant with your Lead Form label

**Success:** All 4 events fire. Success screen shows "Adam or Logan — will reach out within 15 minutes."
**Failure diagnostic:** If form submits but no `generate_lead` → check browser console for JavaScript errors. Likely a gtag loading issue (ad blocker, script timeout).

#### 4d. Test notifications

1. Check your email inbox (adam@ and logan@) for the lead notification
2. Check both SMS numbers for the SMS notification
3. Check Vercel → Logs → look for `[NEW LEAD]` entry

**Success:** Email received with all fields populated (including UTM empty strings for this test). SMS received with name, address, condition, timeline.
**Blocker:** If neither email nor SMS arrives → check Vercel logs for `[EMAIL ERROR]` or `[SMS ERROR]`. Likely missing API keys.

#### 4e. Test with UTM parameters

1. Navigate to: `https://dominionhomedeals.com/sell?utm_source=google&utm_medium=cpc&utm_campaign=spokane_seller_search&utm_term=sell+my+house+fast`
2. Submit another test form
3. Verify the email notification includes: `UTM: google / cpc / spokane_seller_search`

**Success:** UTMs appear in the lead notification.
**Failure diagnostic:** If UTMs are blank → check that `LeadForm` is reading `window.location.search` on mount. Should work as long as the URL has the params when the page first loads.

#### 4f. Verify call-click scoping (non-/sell page)

1. Navigate to the homepage: `https://dominionhomedeals.com`
2. Click the phone number in the header
3. GA4 should show `click_to_call` event
4. Tag Assistant should show NO Google Ads conversion event

**Success:** GA4 fires everywhere; Google Ads conversion fires only on `/sell`.

---

### STEP 5: Build the Campaign

**Where:** Google Ads UI (or Google Ads Editor)
**Who:** You
**Time:** 45-60 minutes

Use the build sheet in LAUNCH_PACK.md Section D. The tables there have every keyword, headline, description, and setting.

**The 5 settings you must get right:**

| Setting | Correct Value | Wrong Value That Wastes Money |
|---------|--------------|-------------------------------|
| Networks | Search only — uncheck Partners and Display | "Search Partners" checked leaks to junk placements |
| Location targeting | **Presence: People in or regularly in** | "Presence or interest" leaks to out-of-area |
| Max CPC bid limit | $12.00 | No cap means Google can bid $30+ per click |
| All final URLs | `https://dominionhomedeals.com/sell` | Wrong URL means no tracking, no form, no leads |
| Ad schedule | 6 AM – 10 PM Pacific | All-hours means spend at 3 AM with no one to answer |

**Build order within Google Ads:**

1. Create campaign with settings from the build sheet
2. Create shared negative keyword list (`Spokane Seller Search — Negatives`) with all 28 negatives
3. Apply negative list to the campaign
4. Create ad group 1 → add 13 keywords → create RSA with 12 headlines + 4 descriptions → set final URL + display path
5. Create ad group 2 → add 7 keywords → create RSA with 10 headlines + 4 descriptions → set final URL + display path
6. Create ad group 3 → add 6 keywords → create RSA with 10 headlines + 4 descriptions → set final URL + display path
7. Create ad group 4 → add 6 keywords → create RSA with 10 headlines + 4 descriptions → set final URL + display path
8. Add extensions: 3 sitelinks, call asset, 4 callouts, structured snippet (all from build sheet)
9. **Do not enable yet** — leave campaign paused

**Success:** Campaign shows as "Paused" with 4 ad groups, 32 keywords, 4 RSAs, 28 negatives, and all extensions.
**Blocker:** If any RSA shows a headline/description error → a char count is wrong. Re-check against the build sheet tables.

---

### STEP 6: Final Go / No-Go Check (Section C below)

Run the checklist in Section C. If all items pass → enable the campaign.

---

### STEP 7: Enable Campaign

**Where:** Google Ads UI
**Who:** You
**Time:** 1 minute

1. Set campaign status to Enabled
2. Note the exact time you enabled it

---

### STEP 8: Post-Launch (within first hour)

**Where:** GA4 Admin + Google Ads UI
**Who:** You
**Time:** 15 minutes

1. **GA4 → Admin → Events:** Find `generate_lead` → toggle "Mark as key event"
2. **GA4 → Admin → Events:** Find `click_to_call` → toggle "Mark as key event"
3. **GA4 → Admin → Custom definitions → Create custom dimensions:**
   - `landing_page` (Event scope)
   - `utm_source` (Event scope)
   - `property_city` (Event scope)
   - `seller_timeline` (Event scope)
   - `cta_location` (Event scope)
4. **Google Ads → Ads & extensions:** Check all 4 RSAs for approval status
   - If any disapproved: read the reason, fix the flagged headline/description, resubmit
5. **Google Ads → Campaigns overview:** Confirm impressions are starting to appear (may take 1-3 hours)

**Success:** Key events marked, custom dimensions created, ads approved or under review, first impressions appearing.

---

### STEP 9: Day 1 Monitoring

Follow the monitoring SOP in LAUNCH_PACK.md Section F. The key checks:

**At launch + 2 hours:**
- Ads approved?
- Impressions flowing?
- Geo correct?

**At end of day 1:**
- Search terms clean?
- CPC range reasonable ($5-12)?
- Any leads? If yes → response time?
- Any form_step events?
- Any Vercel API errors?

---

## C. Go / No-Go Checklist

Run this checklist with the campaign still paused, right before you enable it. Every item must be YES.

### Code & Deployment

| # | Check | Yes/No |
|---|-------|--------|
| 1 | `/sell` page loads at `dominionhomedeals.com/sell` | |
| 2 | Form submits successfully with test data | |
| 3 | Email notification received at adam@ and logan@ | |
| 4 | SMS notification received at both operator numbers | |
| 5 | `generate_lead` event visible in GA4 Realtime after form submit | |
| 6 | Google Ads conversion fires in Tag Assistant after form submit (with correct label) | |
| 7 | `click_to_call` fires on `/sell` phone click (GA4 + Google Ads conversion) | |
| 8 | `click_to_call` fires on non-/sell phone click (GA4 only, no Google Ads conversion) | |
| 9 | UTM parameters appear in lead notification email when present in URL | |

### Google Ads Campaign

| # | Check | Yes/No |
|---|-------|--------|
| 10 | Campaign type = Search only (not Display, not Search Partners) | |
| 11 | Location targeting = **Presence only** (not Presence or interest) | |
| 12 | Location = Spokane County, WA + 15-mile radius | |
| 13 | Bidding = Maximize Clicks with $12 max CPC cap | |
| 14 | Daily budget = $30 | |
| 15 | Ad schedule = 6 AM – 10 PM Pacific, all days | |
| 16 | All 4 ad groups present with correct keyword counts (13, 7, 6, 6) | |
| 17 | All 4 RSAs present — no disapprovals or character limit errors | |
| 18 | All 4 final URLs = `https://dominionhomedeals.com/sell` | |
| 19 | Shared negative keyword list applied (28 negatives) | |
| 20 | Extensions added: sitelinks, call, callouts, structured snippet | |

### Operations

| # | Check | Yes/No |
|---|-------|--------|
| 21 | Adam and Logan both know the campaign is going live today | |
| 22 | Phone (509-822-5460) is actively monitored for calls/texts | |
| 23 | Email inboxes (adam@, logan@) are actively monitored for lead notifications | |
| 24 | Both team members can respond to a lead within 10 minutes | |

**Decision rule:** If items 1-20 are all YES, and at least items 21-22 are YES → **GO**.
If any item 1-9 is NO → **NO-GO** until fixed (conversion tracking or notification issue).
If any item 10-19 is NO → **NO-GO** until fixed (campaign misconfiguration).
If items 21-24 are NO → campaign can launch, but leads may be wasted. Decide based on timing.

---

## D. First-72-Hours Rollback / Pause Rules

These are the conditions under which you should pause the campaign or take emergency action.

### PAUSE the campaign immediately if:

| Condition | Where to Check | Why |
|-----------|---------------|-----|
| Geo targeting is set to "Presence or interest" | Google Ads → Campaign Settings → Locations → Location options | Silent budget leak to irrelevant out-of-area traffic. Fix the setting, then unpause |
| Search Partners or Display Network is checked | Google Ads → Campaign Settings → Networks | Uncontrolled spend on non-search placements. Uncheck, then unpause |
| All 4 RSAs are disapproved simultaneously | Google Ads → Ads & extensions | No ads can show. Fix flagged copy, resubmit, then unpause |
| Conversion tags are not firing (verified via Tag Assistant) | Tag Assistant on `/sell` | Spending money with no measurement. Fix env vars → redeploy → verify → unpause |
| `/sell` page is down or returns error | Visit `dominionhomedeals.com/sell` | Paying for clicks to a broken page. Fix deployment, then unpause |
| Lead notification pipeline is completely broken (no email AND no SMS) | Submit test form, check email + SMS + Vercel logs | Leads are coming in but nobody knows. Fix notifications, then unpause |

### LOWER budget (from $30 to $15/day) if:

| Condition | When to Check | Why |
|-----------|--------------|-----|
| > 50% of search terms are clearly irrelevant after 20+ clicks | End of day 2 | Budget is being wasted. Add negatives first, then consider restoring budget |
| Avg CPC > $15 consistently | End of day 2 | Campaign is too expensive per click. Lower max CPC cap to $8 before restoring budget |
| Zero form_step events after $100+ spend | Day 3-4 | People are clicking but not engaging with the form at all. Investigate landing page before spending more |

### INCREASE budget (to $40-50/day) if:

| Condition | When to Check | Why |
|-----------|--------------|-----|
| Search terms are clean (< 20% waste) AND at least 1 lead in first 3 days | Day 3-4 | Campaign is working, give it more data to learn faster |
| Avg CPC is under $8 with good CTR (> 5%) | Day 3-4 | Efficient traffic — spend more to get volume |

### DO NOT PAUSE for:

| Condition | Why |
|-----------|-----|
| Zero leads in first 48 hours | At $30/day you may only get 3-6 clicks/day. Not enough data yet to conclude anything |
| One ad disapproved (out of 4) | Other 3 still run. Fix the disapproved one but don't pause |
| CPC is $8-12 | This is normal for motivated-seller keywords in a mid-sized market |
| Low impression volume on Inherited or Landlord groups | These are lower-volume niches. Expected |
| One spam lead | Honeypot and rate limiting are in place. One is noise, not a pattern |

---

## E. Recommended Next Single Action Right Now

**Log into Google Ads account `AW-17965617200` and create the two conversion actions (Lead Form + Call Intent).**

This is the first domino. Everything else flows from it:
- You get the two conversion labels
- You set them in Vercel
- You redeploy
- You verify events
- You build the campaign
- You launch

The code is done. The build sheet is done. The QA checklist is done. The monitoring plan is done. The only thing standing between you and launch is 90 minutes of platform work, starting with those two conversion actions.
