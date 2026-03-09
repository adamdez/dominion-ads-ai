import type { RiskLevel } from '@/types/recommendations';
import { Badge } from '@/components/ui/badge';
import { RISK_STYLES } from '@/lib/recommendation-helpers';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const style = RISK_STYLES[level];

  return (
    <Badge className={cn(style.bg, style.text, 'border', style.border)}>
      <span
        className={cn('w-1.5 h-1.5 rounded-full mr-1.5', style.accent)}
      />
      {style.label}
    </Badge>
  );
}
