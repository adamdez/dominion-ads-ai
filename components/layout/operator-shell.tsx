import { NavLink } from './nav-link';

// Inline SVG icons — no external icon library needed
const icons = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  proposals: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 1.5V6a1 1 0 001 1h2.5L11 3.5zM6 11a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm3-3a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zm0 3a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  recommendations: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
        clipRule="evenodd"
      />
    </svg>
  ),
  searchTerms: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clipRule="evenodd"
      />
    </svg>
  ),
  campaigns: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  ),
  audit: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

interface OperatorShellProps {
  children: React.ReactNode;
}

export function OperatorShell({ children }: OperatorShellProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-surface-900 border-r border-surface-500/40 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-surface-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-brand to-accent-test flex items-center justify-center">
              <span
                className="text-white text-sm font-bold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                D
              </span>
            </div>
            <div>
              <h1
                className="text-sm font-semibold text-text-primary tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Dominion
              </h1>
              <p className="text-[10px] text-text-dim font-medium uppercase tracking-[0.15em] mt-0.5">
                Ads Operator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink
            href="/operator/dashboard"
            label="Dashboard"
            icon={icons.dashboard}
          />
          <NavLink
            href="/operator/proposals"
            label="Proposals"
            icon={icons.proposals}
          />
          <NavLink
            href="/operator/recommendations"
            label="Recommendations"
            icon={icons.recommendations}
          />
          <NavLink
            href="/operator/search-terms"
            label="Search Terms"
            icon={icons.searchTerms}
          />
          <NavLink
            href="/operator/campaigns"
            label="Campaigns"
            icon={icons.campaigns}
          />
          <NavLink
            href="/operator/audit"
            label="Audit Log"
            icon={icons.audit}
          />
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-surface-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-risk-green animate-pulse" />
            <span
              className="text-[10px] text-text-dim uppercase tracking-[0.12em]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              System Online
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
