/**
 * Manual Google Ads Sync — CLI entry point.
 *
 * Pulls campaigns, ad groups, keywords, search terms, and daily metrics
 * from Google Ads and upserts them into Supabase.  Read-only on the
 * Google Ads side; write-only on the Supabase side.
 *
 * Usage:
 *   npx tsx scripts/run-sync.ts                        # last 30 days
 *   npx tsx scripts/run-sync.ts --days 7               # last 7 days
 *   npx tsx scripts/run-sync.ts --start 2026-02-01 --end 2026-02-28
 *
 * Prerequisites:
 *   .env.local must contain all Google Ads + Supabase credentials.
 *   See lib/config.ts for the full list.
 *
 * Campaign → Market mapping:
 *   The script currently defaults every campaign to 'spokane'.
 *   To assign specific campaigns to 'kootenai', add entries to the
 *   CAMPAIGN_MARKET_MAP below.  Once we have a UI for this, the map
 *   will be stored in the database instead.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Market } from '../types/markets';

// ── Load .env.local ─────────────────────────────────────────────
// Must happen BEFORE any module that reads process.env is imported.
// We load synchronously so dynamic imports below see the populated vars.

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
    // Don't overwrite existing env vars (e.g. CI-injected secrets)
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

// Load env FIRST — before config module is resolved
loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));

// ── CLI arg parsing ─────────────────────────────────────────────

function parseArgs(): { startDate: string; endDate: string } {
  const args = process.argv.slice(2);
  let startDate: string | undefined;
  let endDate: string | undefined;
  let days = 30; // default

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--start':
        startDate = args[++i];
        break;
      case '--end':
        endDate = args[++i];
        break;
      case '--days':
        days = parseInt(args[++i], 10);
        if (isNaN(days) || days < 1) {
          console.error('❌ --days must be a positive integer');
          process.exit(1);
        }
        break;
    }
  }

  if (startDate && endDate) {
    return { startDate, endDate };
  }

  // Default: last N days
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  return {
    startDate: start.toISOString().slice(0, 10), // YYYY-MM-DD
    endDate: end.toISOString().slice(0, 10),
  };
}

// ── Campaign → Market mapping ───────────────────────────────────
// TODO: Move this to a database table or admin UI.
// For now, map specific Google Ads campaign IDs to their market.
// Any campaign not listed here defaults to 'spokane'.

const CAMPAIGN_MARKET_MAP: Record<string, Market> = {
  // Example:
  // '12345678901': 'kootenai',
  // '98765432109': 'spokane',
};

// ── Main ────────────────────────────────────────────────────────

async function main() {
  // Dynamic imports — env vars are populated by now.
  // (Static imports would hoist above loadEnvFile and read empty env.)
  const { createClient } = await import('@supabase/supabase-js');
  const { config } = await import('../lib/config');
  const { GoogleAdsClient } = await import('../integrations/google-ads/client');
  const { runGoogleAdsSync } = await import('../services/sync/google-ads-sync');

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Dominion Ads — Google Ads Manual Sync');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // ── Credential check ──────────────────────────────────────────
  const missing: string[] = [];
  if (!config.googleAds.clientId) missing.push('GOOGLE_ADS_CLIENT_ID');
  if (!config.googleAds.clientSecret) missing.push('GOOGLE_ADS_CLIENT_SECRET');
  if (!config.googleAds.developerToken) missing.push('GOOGLE_ADS_DEVELOPER_TOKEN');
  if (!config.googleAds.refreshToken) missing.push('GOOGLE_ADS_REFRESH_TOKEN');
  if (!config.googleAds.customerId) missing.push('GOOGLE_ADS_CUSTOMER_ID');
  if (!config.supabase.url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!config.supabase.serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    for (const key of missing) {
      console.error(`   - ${key}`);
    }
    console.error('\n   Check .env.local and try again.\n');
    process.exit(1);
  }

  const { startDate, endDate } = parseArgs();

  console.log(`  Date range:  ${startDate}  →  ${endDate}`);
  console.log(`  Customer ID: ${config.googleAds.customerId}`);
  if (config.googleAds.loginCustomerId) {
    console.log(`  MCC ID:      ${config.googleAds.loginCustomerId}`);
  }
  console.log('');

  // Use service role key for CLI sync — bypasses RLS
  const supabase = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey
  );

  const adsClient = new GoogleAdsClient();

  try {
    const result = await runGoogleAdsSync(supabase, adsClient, {
      startDate,
      endDate,
      campaignMarketMap: CAMPAIGN_MARKET_MAP,
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✓ Sync completed successfully');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log(`  Campaigns:     ${result.campaigns}`);
    console.log(`  Ad groups:     ${result.ad_groups}`);
    console.log(`  Keywords:      ${result.keywords}`);
    console.log(`  Search terms:  ${result.search_terms}`);
    console.log(`  Daily metrics: ${result.daily_metrics}`);
    console.log('');
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════');
    console.error('  ✗ Sync failed');
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
    console.error(
      `  ${error instanceof Error ? error.message : String(error)}`
    );
    console.error('');
    process.exit(1);
  }
}

main();
