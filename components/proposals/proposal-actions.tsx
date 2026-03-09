'use client';

import type { ProposalStatus } from '@/types/campaign-proposals';
import { cn } from '@/lib/utils';

interface ProposalActionsProps {
  status: ProposalStatus;
  isLoading: boolean;
  onAction: (action: 'approved' | 'edits_requested' | 'rejected') => void;
}

export function ProposalActions({ status, isLoading, onAction }: ProposalActionsProps) {
  // Only show actions for reviewable states
  if (status !== 'pending_review' && status !== 'edits_requested') {
    return null;
  }

  return (
    <div className="glass-elevated rounded-xl overflow-hidden">
      <div className="px-5 py-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1.5">
          Operator Decision
        </h3>
        <p className="text-xs text-text-muted mb-5">
          Review the proposal above, then approve, request changes, or reject.
          No changes will be made to Google Ads until deployment.
        </p>

        <div className="flex flex-wrap gap-3">
          {/* Approve */}
          <button
            onClick={() => onAction('approved')}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
              'text-sm font-semibold transition-all duration-200',
              'bg-accent-approve/15 text-accent-approve border border-accent-approve/25',
              'hover:bg-accent-approve/25 hover:border-accent-approve/40',
              'active:scale-[0.97]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
            )}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
            Approve Proposal
          </button>

          {/* Request Edits */}
          <button
            onClick={() => onAction('edits_requested')}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
              'text-sm font-semibold transition-all duration-200',
              'bg-amber-500/10 text-amber-400 border border-amber-500/20',
              'hover:bg-amber-500/20 hover:border-amber-500/35',
              'active:scale-[0.97]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
            )}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L3.463 11.098a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l8.61-8.61a.25.25 0 000-.354l-1.086-1.086z" />
            </svg>
            Request Edits
          </button>

          {/* Reject */}
          <button
            onClick={() => onAction('rejected')}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
              'text-sm font-semibold transition-all duration-200',
              'bg-red-500/10 text-red-400 border border-red-500/20',
              'hover:bg-red-500/20 hover:border-red-500/35',
              'active:scale-[0.97]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
            )}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
            Reject
          </button>
        </div>

        {isLoading && (
          <p
            className="text-xs text-text-dim mt-3 animate-pulse"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Processing action...
          </p>
        )}
      </div>
    </div>
  );
}
