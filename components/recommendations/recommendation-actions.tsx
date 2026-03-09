'use client';

import type { RecommendationStatus } from '@/types/recommendations';
import { cn } from '@/lib/utils';

interface RecommendationActionsProps {
  recommendationId: number;
  status: RecommendationStatus;
  isLoading: boolean;
  onAction: (id: number, action: 'approved' | 'testing' | 'ignored') => void;
}

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: 'approve' | 'test' | 'ignore';
  disabled: boolean;
}

function ActionButton({
  label,
  icon,
  onClick,
  variant,
  disabled,
}: ActionButtonProps) {
  const styles = {
    approve:
      'text-accent-approve bg-accent-approve/8 hover:bg-accent-approve/16 border-accent-approve/20 hover:border-accent-approve/35',
    test: 'text-accent-test bg-accent-test/8 hover:bg-accent-test/16 border-accent-test/20 hover:border-accent-test/35',
    ignore:
      'text-accent-ignore bg-accent-ignore/8 hover:bg-accent-ignore/16 border-accent-ignore/20 hover:border-accent-ignore/35',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5',
        'text-xs font-medium border transition-all duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        styles[variant]
      )}
    >
      <span className="w-3.5 h-3.5">{icon}</span>
      {label}
    </button>
  );
}

// Inline SVG icons
const CheckIcon = (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
      clipRule="evenodd"
    />
  </svg>
);

const BeakerIcon = (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M5.5 1.5A.5.5 0 016 1h4a.5.5 0 010 1h-.5v3.379l3.354 5.03A1.5 1.5 0 0111.605 13H4.395a1.5 1.5 0 01-1.249-2.592L6.5 5.38V2H6a.5.5 0 01-.5-.5zM7.5 5.694V2h1v3.694a.5.5 0 00.083.277L11.16 10H4.84l2.577-4.029a.5.5 0 00.083-.277z" />
  </svg>
);

const XIcon = (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M4.28 3.22a.75.75 0 00-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 101.06 1.06L8 9.06l3.72 3.72a.75.75 0 101.06-1.06L9.06 8l3.72-3.72a.75.75 0 00-1.06-1.06L8 6.94 4.28 3.22z"
      clipRule="evenodd"
    />
  </svg>
);

const SpinnerIcon = (
  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.25"
    />
    <path
      d="M14 8a6 6 0 00-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// TODO: No confirmation dialog before taking action. Consider adding a
// confirmation step for high-risk recommendations (risk_level === 'red')
// or for the "Ignore" action, which is harder to undo.
// TODO: No undo mechanism. Once an action is taken, the operator must
// contact engineering or use the database directly to reverse it.
export function RecommendationActions({
  recommendationId,
  status,
  isLoading,
  onAction,
}: RecommendationActionsProps) {
  // Only show action buttons for pending recommendations
  if (status !== 'pending') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-text-muted text-xs">
        {SpinnerIcon}
        <span style={{ fontFamily: 'var(--font-mono)' }}>Processing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ActionButton
        label="Approve"
        icon={CheckIcon}
        variant="approve"
        disabled={false}
        onClick={() => onAction(recommendationId, 'approved')}
      />
      <ActionButton
        label="Test"
        icon={BeakerIcon}
        variant="test"
        disabled={false}
        onClick={() => onAction(recommendationId, 'testing')}
      />
      <ActionButton
        label="Ignore"
        icon={XIcon}
        variant="ignore"
        disabled={false}
        onClick={() => onAction(recommendationId, 'ignored')}
      />
    </div>
  );
}
