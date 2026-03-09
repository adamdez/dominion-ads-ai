/**
 * Google Ads OAuth2 token refresh.
 *
 * Uses the offline refresh token (obtained via the helper script) to
 * mint short-lived access tokens.  Tokens are cached in-memory and
 * refreshed automatically when they expire.
 *
 * No npm dependency beyond global `fetch` (Node 18+).
 */

import { config } from '../../lib/config';
import { logger } from '../../lib/logger';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

/** Refresh 5 minutes before actual expiry to avoid clock-skew races. */
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

// ── In-memory cache ─────────────────────────────────────────────
let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Returns a valid access token, refreshing if necessary.
 * Safe to call on every API request — it only hits Google when the
 * cached token is expired or about to expire.
 */
export async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const { clientId, clientSecret, refreshToken } = config.googleAds;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Google Ads OAuth credentials. ' +
        'Ensure GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and ' +
        'GOOGLE_ADS_REFRESH_TOKEN are set in .env.local'
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Google OAuth token refresh failed (HTTP ${response.status}): ${text}`
    );
  }

  const data = (await response.json()) as GoogleTokenResponse;

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000 - EXPIRY_BUFFER_MS;

  logger.info('Google Ads access token refreshed', {
    expiresInSeconds: data.expires_in,
  });

  return cachedAccessToken;
}

/**
 * Force-clears the cached token.
 * Useful if an API call returns 401 and we need to re-authenticate.
 */
export function clearCachedToken(): void {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
}
