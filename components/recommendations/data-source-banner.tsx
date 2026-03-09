'use client';

import type { DataSourceMode } from '@/app/operator/recommendations/page';

interface DataSourceBannerProps {
  mode: DataSourceMode;
  error?: string;
}

/**
 * Visible banner that tells the operator exactly where data is coming from.
 *
 * - 'live': no banner shown — clean, uncluttered default.
 * - 'mock': amber banner — developer is working without Supabase, data is static.
 * - 'degraded': red banner — Supabase is configured but the fetch failed. Actions
 *   will also fail because the API route relies on the same connection.
 *
 * TODO: Remove this component (or the mock/degraded paths) once Supabase is
 * always configured and stable in all environments.
 */
export function DataSourceBanner({ mode, error }: DataSourceBannerProps) {
  if (mode === 'live') return null;

  if (mode === 'mock') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-risk-yellow/30 bg-risk-yellow-bg px-4 py-3">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 text-risk-yellow flex-shrink-0 mt-0.5"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-risk-yellow">
            Dev mode — showing mock data
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            Supabase is not configured. Recommendations are static samples. Actions will
            not persist.
          </p>
        </div>
        <span
          className="inline-flex items-center rounded-md bg-risk-yellow/15 px-2 py-0.5 text-[10px] font-medium text-risk-yellow uppercase tracking-wider flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Mock
        </span>
      </div>
    );
  }

  // mode === 'degraded'
  return (
    <div className="flex items-start gap-3 rounded-xl border border-risk-red/30 bg-risk-red-bg px-4 py-3">
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5 text-risk-red flex-shrink-0 mt-0.5"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-risk-red">
          Database unavailable — showing fallback data
        </p>
        <p className="text-xs text-text-secondary mt-0.5">
          Supabase is configured but the query failed. Displaying mock data as a fallback.
          Actions will fail until the connection is restored.
          {error && (
            <span
              className="block mt-1 text-text-dim"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Error: {error}
            </span>
          )}
        </p>
      </div>
      <span
        className="inline-flex items-center rounded-md bg-risk-red/15 px-2 py-0.5 text-[10px] font-medium text-risk-red uppercase tracking-wider flex-shrink-0"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Degraded
      </span>
    </div>
  );
}
