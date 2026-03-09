import { cn } from '@/lib/utils';

interface ProposalAssumptionsProps {
  assumptions: string[];
}

export function ProposalAssumptions({ assumptions }: ProposalAssumptionsProps) {
  return (
    <div className="glass-elevated rounded-xl overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-risk-yellow">
            <path
              fillRule="evenodd"
              d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-9.5a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 018 5.5zM8 12a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-sm font-semibold text-text-primary">
            Assumptions & Prerequisites
          </h3>
        </div>

        <ul className="space-y-2">
          {assumptions.map((assumption, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed"
            >
              <span
                className="flex-shrink-0 w-5 h-5 rounded bg-risk-yellow-bg text-risk-yellow text-[10px] flex items-center justify-center mt-0.5"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {i + 1}
              </span>
              {assumption}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
