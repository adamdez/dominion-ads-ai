import type { Market } from '@/types/markets';
import { Badge } from '@/components/ui/badge';
import { MARKET_STYLES } from '@/lib/recommendation-helpers';
import { cn } from '@/lib/utils';

interface MarketBadgeProps {
  market: Market | null;
}

export function MarketBadge({ market }: MarketBadgeProps) {
  if (!market) return null;

  const style = MARKET_STYLES[market];
  if (!style) return null;

  return (
    <Badge className={cn(style.bg, style.text, 'border', style.border)}>
      {style.label}
    </Badge>
  );
}
