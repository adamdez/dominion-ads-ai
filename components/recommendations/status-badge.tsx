import type { RecommendationStatus } from '@/types/recommendations';
import { STATUS_STYLES } from '@/lib/recommendation-helpers';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RecommendationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5',
        'text-[10px] uppercase tracking-widest font-medium',
        style.bg,
        style.text
      )}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {style.label}
    </span>
  );
}
