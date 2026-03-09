/**
 * Diagnostic 1: Google Ads Account Overview
 *
 * Read-only inspection of the connected Google Ads account.
 * Lists every campaign visible to the API with:
 *   - campaign ID
 *   - campaign name
 *   - advertising channel type (SEARCH, PERFORMANCE_MAX, etc.)
 *   - status (ENABLED, PAUSED, REMOVED)
 *
 * Also lists all customer accounts accessible through the MCC.
 *
 * Usage:
 *   npx tsx scripts/diagnose-account.ts
 *
 * What this confirms:
 *   - OAuth credentials are valid
 *   - CUSTOMER_ID and LOGIN_CUSTOMER_ID are correctly assigned
 *   - Which campaigns exist and what types they are
 *   - Whether the MCC can see other client accounts
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

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const { config } = await import('../lib/config');
  const { getAccessToken } = await import('../integrations/google-ads/auth');
  const { executeGaql } = await import('../integrations/google-ads/client');

  const API_VERSION = 'v23';

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Diagnostic 1: Google Ads Account Overview');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // ── Show current config ───────────────────────────────────────
  const customerId = config.googleAds.customerId;
  const loginCustomerId = config.googleAds.loginCustomerId;

  console.log('  Config:');
  console.log(`    GOOGLE_ADS_CUSTOMER_ID       = ${customerId || '(empty)'}`);
  console.log(`    GOOGLE_ADS_LOGIN_CUSTOMER_ID  = ${loginCustomerId || '(empty)'}`);
  console.log(`    GOOGLE_ADS_DEVELOPER_TOKEN    = ${config.googleAds.developerToken ? '(set)' : '(empty)'}`);
  console.log(`    GOOGLE_ADS_REFRESH_TOKEN      = ${config.googleAds.refreshToken ? '(set)' : '(empty)'}`);
  console.log('');
  console.log('  Meaning:');
  console.log(`    Client account queried:  ${customerId} (in URL path)`);
  console.log(`    MCC used for auth:       ${loginCustomerId || '(none — direct access)'} (login-customer-id header)`);
  console.log('');

  // ── Step 1: List accessible customers via MCC ─────────────────
  console.log('───────────────────────────────────────────────────────');
  console.log('  Accessible Customers (via MCC)');
  console.log('───────────────────────────────────────────────────────');

  try {
    const accessToken = await getAccessToken();
    const stripDashes = (id: string) => id.replace(/-/g, '');

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': config.googleAds.developerToken,
    };
    if (loginCustomerId) {
      headers['login-customer-id'] = stripDashes(loginCustomerId);
    }

    const res = await fetch(
      `https://googleads.googleapis.com/${API_VERSION}/customers:listAccessibleCustomers`,
      { method: 'GET', headers }
    );

    if (!res.ok) {
      const text = await res.text();
      console.log(`  ⚠ Could not list accessible customers (HTTP ${res.status})`);
      console.log(`    ${text.slice(0, 200)}`);
    } else {
      const data = (await res.json()) as { resourceNames?: string[] };
      const names = data.resourceNames ?? [];
      console.log(`  Found ${names.length} accessible customer(s):`);
      for (const rn of names) {
        // format: "customers/1234567890"
        const id = rn.replace('customers/', '');
        const isCurrent = id === stripDashes(customerId);
        const isLogin = id === stripDashes(loginCustomerId);
        let label = '';
        if (isCurrent) label = ' ← CUSTOMER_ID (queried)';
        if (isLogin) label = ' ← LOGIN_CUSTOMER_ID (MCC)';
        console.log(`    ${id}${label}`);
      }
    }
  } catch (err) {
    console.log(`  ✗ Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log('');

  // ── Step 2: List all campaigns ────────────────────────────────
  console.log('───────────────────────────────────────────────────────');
  console.log('  All Campaigns (including PAUSED)');
  console.log('───────────────────────────────────────────────────────');

  try {
    // Broader query than the sync uses — includes PAUSED campaigns
    // and adds budget info for context. Still excludes REMOVED.
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.name
    `;

    const rows = await executeGaql(query);

    if (rows.length === 0) {
      console.log('  (no campaigns found)');
    } else {
      console.log('');
      for (const r of rows) {
        const id = r.campaign?.id ?? '?';
        const name = r.campaign?.name ?? '?';
        const status = r.campaign?.status ?? '?';
        const type = r.campaign?.advertisingChannelType ?? '?';
        // bidding strategy type lives on the campaign object in REST
        const bidding = (r as Record<string, unknown>).campaign
          ? ((r as Record<string, Record<string, unknown>>).campaign?.biddingStrategyType as string) ?? 'N/A'
          : 'N/A';
        // budget is a separate resource
        const budgetMicros = (r as Record<string, Record<string, unknown>>).campaignBudget?.amountMicros as string | undefined;
        const budgetStr = budgetMicros
          ? `$${(Number(budgetMicros) / 1_000_000).toFixed(2)}/day`
          : 'N/A';

        console.log(`  Campaign ID:   ${id}`);
        console.log(`  Name:          ${name}`);
        console.log(`  Channel Type:  ${type}`);
        console.log(`  Status:        ${status}`);
        console.log(`  Bidding:       ${bidding}`);
        console.log(`  Daily Budget:  ${budgetStr}`);
        console.log('');
      }
      console.log(`  Total: ${rows.length} campaign(s)`);
    }
  } catch (err) {
    console.log(`  ✗ Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log('');

  // ── Step 3: Campaign type summary ─────────────────────────────
  console.log('───────────────────────────────────────────────────────');
  console.log('  Campaign Type Summary');
  console.log('───────────────────────────────────────────────────────');

  try {
    const query = `
      SELECT
        campaign.advertising_channel_type,
        campaign.status
      FROM campaign
      WHERE campaign.status != 'REMOVED'
    `;

    const rows = await executeGaql(query);
    const typeCounts = new Map<string, number>();
    const hasSearch = rows.some(r => r.campaign?.advertisingChannelType === 'SEARCH');

    for (const r of rows) {
      const type = r.campaign?.advertisingChannelType ?? 'UNKNOWN';
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }

    for (const [type, count] of typeCounts) {
      console.log(`  ${type}: ${count}`);
    }

    console.log('');
    if (hasSearch) {
      console.log('  ✓ SEARCH campaigns found — keyword-level sync will have data');
    } else {
      console.log('  ⚠ No SEARCH campaigns found');
      console.log('    The current sync pipeline (ad groups, keywords, keyword_view,');
      console.log('    search_term_view) is designed for Search campaigns.');
      console.log('    PMax campaigns use asset groups and have limited reporting');
      console.log('    via these endpoints.');
    }
  } catch (err) {
    console.log(`  ✗ Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Diagnostic complete');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
}

main().catch((err) => {
  console.error(`\n✗ Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
