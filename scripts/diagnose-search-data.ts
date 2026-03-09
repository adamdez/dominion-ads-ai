/**
 * Diagnostic 2: Search Campaign Data Availability
 *
 * Read-only check of whether keyword-based Search campaign data
 * is available in the connected Google Ads account.
 *
 * Probes each data source the sync pipeline depends on:
 *   1. SEARCH-type campaigns
 *   2. Ad groups
 *   3. Keywords (ad_group_criterion)
 *   4. search_term_view (last 30 days)
 *   5. keyword_view (last 30 days)
 *
 * Also checks PMax campaign-level metrics to see if spend is flowing.
 *
 * Usage:
 *   npx tsx scripts/diagnose-search-data.ts
 *
 * What this confirms:
 *   - Whether the sync pipeline can actually populate data
 *   - Which of the 5 sync stages will return rows vs. empty
 *   - Whether the account has any Search campaigns at all
 *   - Whether PMax campaigns are generating any spend/data
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ── Load .env.local before any config reads ─────────────────────

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));

// ── Helpers ─────────────────────────────────────────────────────

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type ProbeResult = {
  name: string;
  count: number;
  status: 'found' | 'empty' | 'error';
  detail?: string;
};

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const { executeGaql } = await import('../integrations/google-ads/client');

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Diagnostic 2: Search Campaign Data Availability');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  const startDate = dateNDaysAgo(30);
  const endDate = today();
  console.log(`  Probing date range: ${startDate} → ${endDate}`);
  console.log('');

  const probes: ProbeResult[] = [];

  // ── Probe 1: SEARCH campaigns ────────────────────────────────
  console.log('  [1/6] Checking for SEARCH campaigns...');
  try {
    const rows = await executeGaql(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type
      FROM campaign
      WHERE campaign.advertising_channel_type = 'SEARCH'
        AND campaign.status != 'REMOVED'
    `);
    probes.push({
      name: 'SEARCH campaigns',
      count: rows.length,
      status: rows.length > 0 ? 'found' : 'empty',
      detail: rows.length > 0
        ? rows.map(r => `${r.campaign?.name} (${r.campaign?.status})`).join(', ')
        : 'No Search campaigns exist in this account',
    });
    console.log(`        → ${rows.length} found`);
  } catch (err) {
    probes.push({ name: 'SEARCH campaigns', count: 0, status: 'error', detail: String(err) });
    console.log(`        → error`);
  }

  // ── Probe 2: Ad groups ────────────────────────────────────────
  console.log('  [2/6] Checking for ad groups...');
  try {
    const rows = await executeGaql(`
      SELECT ad_group.id
      FROM ad_group
      WHERE ad_group.status != 'REMOVED'
    `);
    probes.push({
      name: 'Ad groups',
      count: rows.length,
      status: rows.length > 0 ? 'found' : 'empty',
      detail: rows.length === 0
        ? 'No ad groups — expected if only PMax campaigns exist'
        : undefined,
    });
    console.log(`        → ${rows.length} found`);
  } catch (err) {
    probes.push({ name: 'Ad groups', count: 0, status: 'error', detail: String(err) });
    console.log(`        → error`);
  }

  // ── Probe 3: Keywords ─────────────────────────────────────────
  console.log('  [3/6] Checking for keywords (ad_group_criterion)...');
  try {
    const rows = await executeGaql(`
      SELECT ad_group_criterion.criterion_id
      FROM ad_group_criterion
      WHERE ad_group_criterion.type = 'KEYWORD'
        AND ad_group_criterion.status != 'REMOVED'
    `);
    probes.push({
      name: 'Keywords',
      count: rows.length,
      status: rows.length > 0 ? 'found' : 'empty',
      detail: rows.length === 0
        ? 'No keywords — expected if only PMax campaigns exist'
        : undefined,
    });
    console.log(`        → ${rows.length} found`);
  } catch (err) {
    probes.push({ name: 'Keywords', count: 0, status: 'error', detail: String(err) });
    console.log(`        → error`);
  }

  // ── Probe 4: search_term_view ─────────────────────────────────
  console.log('  [4/6] Checking search_term_view (last 30 days)...');
  try {
    const rows = await executeGaql(`
      SELECT
        search_term_view.search_term,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros
      FROM search_term_view
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `);
    probes.push({
      name: 'search_term_view',
      count: rows.length,
      status: rows.length > 0 ? 'found' : 'empty',
      detail: rows.length === 0
        ? 'No search term data in last 30 days'
        : `${rows.length} search term rows with activity`,
    });
    console.log(`        → ${rows.length} rows`);
  } catch (err) {
    probes.push({ name: 'search_term_view', count: 0, status: 'error', detail: String(err) });
    console.log(`        → error`);
  }

  // ── Probe 5: keyword_view ─────────────────────────────────────
  console.log('  [5/6] Checking keyword_view (last 30 days)...');
  try {
    const rows = await executeGaql(`
      SELECT
        ad_group_criterion.criterion_id,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros
      FROM keyword_view
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `);
    probes.push({
      name: 'keyword_view',
      count: rows.length,
      status: rows.length > 0 ? 'found' : 'empty',
      detail: rows.length === 0
        ? 'No keyword-level metrics — daily_metrics sync will be empty'
        : `${rows.length} keyword metric rows`,
    });
    console.log(`        → ${rows.length} rows`);
  } catch (err) {
    probes.push({ name: 'keyword_view', count: 0, status: 'error', detail: String(err) });
    console.log(`        → error`);
  }

  // ── Probe 6: Campaign-level metrics (all types) ───────────────
  console.log('  [6/6] Checking campaign-level metrics (last 30 days)...');
  try {
    const rows = await executeGaql(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.advertising_channel_type,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status != 'REMOVED'
        AND metrics.impressions > 0
    `);

    const hasSpend = rows.length > 0;
    probes.push({
      name: 'Campaign metrics (all types)',
      count: rows.length,
      status: hasSpend ? 'found' : 'empty',
      detail: hasSpend
        ? `${rows.length} campaign-day rows with impressions`
        : 'No campaign spend in last 30 days — account may be paused or new',
    });
    console.log(`        → ${rows.length} rows with impressions`);

    // Print per-campaign spend summary if data exists
    if (rows.length > 0) {
      const campaignTotals = new Map<string, {
        name: string;
        type: string;
        impressions: number;
        clicks: number;
        costMicros: number;
        conversions: number;
      }>();

      for (const r of rows) {
        const id = r.campaign?.id ?? '?';
        const existing = campaignTotals.get(id) ?? {
          name: r.campaign?.name ?? '?',
          type: r.campaign?.advertisingChannelType ?? '?',
          impressions: 0,
          clicks: 0,
          costMicros: 0,
          conversions: 0,
        };
        existing.impressions += Number(r.metrics?.impressions ?? 0);
        existing.clicks += Number(r.metrics?.clicks ?? 0);
        existing.costMicros += Number(r.metrics?.costMicros ?? 0);
        existing.conversions += (r.metrics?.conversions ?? 0);
        campaignTotals.set(id, existing);
      }

      console.log('');
      console.log('  Campaign Spend Summary (last 30 days):');
      for (const [id, t] of campaignTotals) {
        const cost = (t.costMicros / 1_000_000).toFixed(2);
        console.log(`    ${t.name} [${t.type}]`);
        console.log(`      ID: ${id} | Impr: ${t.impressions} | Clicks: ${t.clicks} | Cost: $${cost} | Conv: ${t.conversions}`);
      }
    }
  } catch (err) {
    probes.push({ name: 'Campaign metrics (all types)', count: 0, status: 'error', detail: String(err) });
    console.log(`        → error`);
  }

  // ── Summary ───────────────────────────────────────────────────
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Results');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  for (const p of probes) {
    const icon = p.status === 'found' ? '✓' : p.status === 'empty' ? '—' : '✗';
    console.log(`  ${icon} ${p.name}: ${p.count}`);
    if (p.detail) {
      console.log(`    ${p.detail}`);
    }
  }

  // ── Verdict ───────────────────────────────────────────────────
  console.log('');
  console.log('───────────────────────────────────────────────────────');
  console.log('  Verdict');
  console.log('───────────────────────────────────────────────────────');

  const searchCampaigns = probes.find(p => p.name === 'SEARCH campaigns');
  const adGroups = probes.find(p => p.name === 'Ad groups');
  const keywords = probes.find(p => p.name === 'Keywords');
  const searchTerms = probes.find(p => p.name === 'search_term_view');
  const keywordView = probes.find(p => p.name === 'keyword_view');
  const campaignMetrics = probes.find(p => p.name === 'Campaign metrics (all types)');

  const hasSearchCampaigns = searchCampaigns?.status === 'found';
  const hasKeywordData = (adGroups?.status === 'found') || (keywords?.status === 'found');
  const hasSearchTermData = searchTerms?.status === 'found';
  const hasKeywordViewData = keywordView?.status === 'found';
  const hasAnyCampaignSpend = campaignMetrics?.status === 'found';

  if (hasSearchCampaigns && hasKeywordData) {
    console.log('');
    console.log('  ✓ SEARCH CAMPAIGN DATA IS AVAILABLE');
    console.log('    The full sync pipeline (campaigns → ad groups → keywords →');
    console.log('    search terms → daily metrics) should produce data.');
    if (!hasSearchTermData) {
      console.log('');
      console.log('    Note: search_term_view returned 0 rows. This is normal if');
      console.log('    the Search campaign is new or paused. Data will appear once');
      console.log('    the campaign has active spend generating search impressions.');
    }
  } else if (hasAnyCampaignSpend && !hasSearchCampaigns) {
    console.log('');
    console.log('  ⚠ ONLY NON-SEARCH CAMPAIGNS ARE ACTIVE');
    console.log('    The account has spend but no Search-type campaigns.');
    console.log('    The current sync pipeline stages 2-5 (ad groups, keywords,');
    console.log('    search terms, daily keyword metrics) will return empty results.');
    console.log('');
    console.log('    This is correct behavior — not a bug.');
    console.log('');
    console.log('    To get full pipeline data, create a keyword-targeted Search');
    console.log('    campaign in Google Ads. PMax campaigns do not expose ad group,');
    console.log('    keyword, or keyword_view data through the API.');
  } else if (!hasAnyCampaignSpend) {
    console.log('');
    console.log('  ⚠ NO CAMPAIGN SPEND IN LAST 30 DAYS');
    console.log('    The account is connected but has no recent activity.');
    console.log('    Campaign structures sync fine, but date-ranged data');
    console.log('    (search terms, daily metrics) will be empty until');
    console.log('    campaigns are active and generating impressions.');
  } else {
    console.log('');
    console.log('  ? INCONCLUSIVE');
    console.log('    Could not determine data availability. Check the probe');
    console.log('    results above for errors.');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
}

main().catch((err) => {
  console.error(`\n✗ Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
