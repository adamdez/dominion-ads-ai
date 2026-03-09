/**
 * Google Ads OAuth Refresh Token Generator
 *
 * One-time helper script that runs the Desktop OAuth flow to obtain a
 * refresh token for the Google Ads API.
 *
 * How to run:
 *   npx tsx scripts/get-google-ads-refresh-token.ts
 *
 * Prerequisites:
 *   - .env.local must have GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET set
 *   - The OAuth client must be a "Desktop" type in Google Cloud Console
 *   - The Google Ads API must be enabled in the Google Cloud project
 *
 * What happens:
 *   1. Script prints an authorization URL
 *   2. You open that URL in your browser
 *   3. Sign in with the Google account that manages your Google Ads
 *   4. Grant access to the Google Ads API
 *   5. Google redirects to http://localhost:9876 (the script catches this)
 *   6. Script exchanges the auth code for a refresh token
 *   7. Refresh token is printed to the terminal — copy it into .env.local
 *
 * Security:
 *   - The refresh token is only printed to your local terminal
 *   - Nothing is written to disk or committed to source control
 *   - The local HTTP server shuts down immediately after catching the callback
 */

import * as http from 'node:http';
import * as https from 'node:https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

// ── Load .env.local ──────────────────────────────────────────────
// Minimal parser — no external dependency needed for a one-off script.

function loadEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return env;
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }
  return env;
}

const envPath = path.resolve(process.cwd(), '.env.local');
const env = loadEnvFile(envPath);

const CLIENT_ID = env.GOOGLE_ADS_CLIENT_ID ?? process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_ADS_CLIENT_SECRET ?? process.env.GOOGLE_ADS_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ Missing credentials.');
  console.error('   Ensure .env.local has GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET set.\n');
  process.exit(1);
}

// ── OAuth config ─────────────────────────────────────────────────

const REDIRECT_PORT = 9876;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}`;
const SCOPES = ['https://www.googleapis.com/auth/adwords'];

const AUTH_URL =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  }).toString();

// ── Token exchange ───────────────────────────────────────────────

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      code,
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString();

    const req = https.request(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data) as TokenResponse);
          } catch {
            reject(new Error(`Failed to parse token response: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Local callback server ────────────────────────────────────────

function startCallbackServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsed = url.parse(req.url ?? '', true);

      const code = parsed.query.code;
      const error = parsed.query.error;

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <html><body style="font-family:system-ui;padding:40px;text-align:center">
            <h2 style="color:#e53e3e">Authorization denied</h2>
            <p>Error: ${String(error)}</p>
            <p>You can close this tab.</p>
          </body></html>
        `);
        server.close();
        reject(new Error(`OAuth denied: ${String(error)}`));
        return;
      }

      if (typeof code === 'string') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html><body style="font-family:system-ui;padding:40px;text-align:center">
            <h2 style="color:#38a169">✓ Authorization successful</h2>
            <p>Return to your terminal to get the refresh token.</p>
            <p>You can close this tab.</p>
          </body></html>
        `);
        server.close();
        resolve(code);
        return;
      }

      // Ignore favicon and other requests
      res.writeHead(404);
      res.end();
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${REDIRECT_PORT} is already in use. Close the process using it and try again.`));
      } else {
        reject(err);
      }
    });

    server.listen(REDIRECT_PORT, () => {
      console.log(`\n⏳ Waiting for callback on ${REDIRECT_URI} ...\n`);
    });

    // Safety timeout — don't leave the server hanging forever
    setTimeout(() => {
      server.close();
      reject(new Error('Timed out after 5 minutes waiting for OAuth callback.'));
    }, 5 * 60 * 1000);
  });
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Google Ads OAuth — Refresh Token Generator');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('  Step 1: Open this URL in your browser:');
  console.log('');
  console.log(`  ${AUTH_URL}`);
  console.log('');
  console.log('  Step 2: Sign in with the Google account that manages');
  console.log('          your Google Ads (the MCC or direct account).');
  console.log('');
  console.log('  Step 3: Click "Allow" to grant Google Ads API access.');
  console.log('');
  console.log('  Step 4: You will be redirected back here automatically.');
  console.log('');

  try {
    const code = await startCallbackServer();
    console.log('✓ Authorization code received. Exchanging for tokens...\n');

    const tokens = await exchangeCodeForTokens(code);

    if (tokens.error) {
      console.error(`❌ Token exchange failed: ${tokens.error}`);
      if (tokens.error_description) {
        console.error(`   ${tokens.error_description}`);
      }
      process.exit(1);
    }

    if (!tokens.refresh_token) {
      console.error('❌ No refresh token returned.');
      console.error('   This usually means you already authorized this app before.');
      console.error('   Revoke access at https://myaccount.google.com/permissions');
      console.error('   then run this script again.\n');
      process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✓ SUCCESS — Your refresh token:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log(`  ${tokens.refresh_token}`);
    console.log('');
    console.log('  Next steps:');
    console.log('  1. Copy the token above');
    console.log('  2. Open .env.local');
    console.log('  3. Set GOOGLE_ADS_REFRESH_TOKEN=<your token>');
    console.log('  4. Do NOT commit .env.local to git');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
  } catch (err) {
    console.error(`\n❌ ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  }
}

main();
