import { Badge } from '@/components/ui/badge';
import { PROPOSAL_STATUS_STYLES } from '@/lib/proposal-helpers';
import type { ProposalStatus } from '@/types/campaign-proposals';
import { cn } from '@/lib/utils';

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
}

export function ProposalStatusBadge({ status }: ProposalStatusBadgeProps) {
  const style = PROPOSAL_STATUS_STYLES[status];

  return (
    <Badge className={cn(style.bg, style.text, 'border', 'border-current/15')}>
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', style.dot)} />
      {style.label}
    </Badge>
  );
}
