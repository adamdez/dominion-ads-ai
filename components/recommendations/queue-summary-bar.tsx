import { cn } from '@/lib/utils';

interface QueueSummaryBarProps {
  totalPending: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  spokaneCount: number;
  kootenaiCount: number;
}

interface StatBlockProps {
  label: string;
  value: number;
  accentColor: string;
  dotColor?: string;
}

function StatBlock({ label, value, accentColor, dotColor }: StatBlockProps) {
  return (
    <div
      className={cn(
        'glass rounded-xl px-5 py-4 flex flex-col gap-1.5 relative overflow-hidden',
        'transition-all duration-300 hover:bg-surface-700/40'
      )}
    >
      {/* Bottom accent line */}
      <div
        className={cn('absolute bottom-0 left-0 right-0 h-[2px]', accentColor)}
        style={{ opacity: 0.5 }}
      />

      <div className="flex items-center gap-2">
        {dotColor && (
          <span className={cn('w-2 h-2 rounded-full', dotColor)} />
        )}
        <span
          className="text-[10px] uppercase tracking-[0.14em] text-text-muted font-medium"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </span>
      </div>

      <span
        className="text-2xl font-semibold text-text-primary tabular-nums"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </span>
    </div>
  );
}

export function QueueSummaryBar({
  totalPending,
  greenCount,
  yellowCount,
  redCount,
  spokaneCount,
  kootenaiCount,
}: QueueSummaryBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatBlock
        label="Pending"
        value={totalPending}
        accentColor="bg-text-secondary"
        dotColor="bg-text-secondary"
      />
      <StatBlock
        label="Low Risk"
        value={greenCount}
        accentColor="bg-risk-green"
        dotColor="bg-risk-green"
      />
      <StatBlock
        label="Moderate"
        value={yellowCount}
        accentColor="bg-risk-yellow"
        dotColor="bg-risk-yellow"
      />
      <StatBlock
        label="High Risk"
        value={redCount}
        accentColor="bg-risk-red"
        dotColor="bg-risk-red"
      />
      <StatBlock
        label="Spokane"
        value={spokaneCount}
        accentColor="bg-market-spokane"
        dotColor="bg-market-spokane"
      />
      <StatBlock
        label="Kootenai"
        value={kootenaiCount}
        accentColor="bg-market-kootenai"
        dotColor="bg-market-kootenai"
      />
    </div>
  );
}
