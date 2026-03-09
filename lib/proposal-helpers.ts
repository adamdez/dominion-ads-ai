/**
 * Proposal styling helpers and display utilities.
 *
 * Follows the same pattern as recommendation-helpers.ts —
 * maps proposal statuses, themes, and match types to design tokens.
 */

import type { ProposalStatus, AdGroupTheme, KeywordMatchType, BiddingStrategy, CampaignObjective } from '@/types/campaign-proposals';
import { AD_GROUP_THEME_LABELS, BIDDING_STRATEGY_LABELS, CAMPAIGN_OBJECTIVE_LABELS } from '@/types/campaign-proposals';

// ── Proposal status styling ──────────────────────────────────────

export const PROPOSAL_STATUS_STYLES: Record<
  ProposalStatus,
  { bg: string; text: string; label: string; dot: string }
> = {
  draft: {
    bg: 'bg-slate-400/10',
    text: 'text-slate-400',
    label: 'Draft',
    dot: 'bg-slate-400',
  },
  pending_review: {
    bg: 'bg-amber-400/10',
    text: 'text-amber-400',
    label: 'Pending Review',
    dot: 'bg-amber-400',
  },
  approved: {
    bg: 'bg-emerald-400/10',
    text: 'text-emerald-400',
    label: 'Approved',
    dot: 'bg-emerald-400',
  },
  edits_requested: {
    bg: 'bg-orange-400/10',
    text: 'text-orange-400',
    label: 'Edits Requested',
    dot: 'bg-orange-400',
  },
  rejected: {
    bg: 'bg-red-400/10',
    text: 'text-red-400',
    label: 'Rejected',
    dot: 'bg-red-400',
  },
  deployed: {
    bg: 'bg-cyan-400/10',
    text: 'text-cyan-400',
    label: 'Deployed',
    dot: 'bg-cyan-400',
  },
};

// ── Ad group theme styling ───────────────────────────────────────

export const THEME_STYLES: Record<
  AdGroupTheme,
  { bg: string; text: string; border: string; icon: string }
> = {
  generic_seller_intent: {
    bg: 'bg-blue-500/8',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    icon: '🏠',
  },
  as_is_repairs: {
    bg: 'bg-orange-500/8',
    text: 'text-orange-400',
    border: 'border-orange-500/20',
    icon: '🔧',
  },
  inherited_probate: {
    bg: 'bg-violet-500/8',
    text: 'text-violet-400',
    border: 'border-violet-500/20',
    icon: '📜',
  },
  landlord_tenant: {
    bg: 'bg-teal-500/8',
    text: 'text-teal-400',
    border: 'border-teal-500/20',
    icon: '🔑',
  },
  urgent_sale: {
    bg: 'bg-rose-500/8',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    icon: '⚡',
  },
};

// ── Match type styling ───────────────────────────────────────────

export const MATCH_TYPE_STYLES: Record<
  KeywordMatchType,
  { bg: string; text: string; label: string; prefix: string }
> = {
  EXACT: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    label: 'Exact',
    prefix: '[ ]',
  },
  PHRASE: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    label: 'Phrase',
    prefix: '" "',
  },
  BROAD: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    label: 'Broad',
    prefix: '+ +',
  },
};

// ── Performance badge styling ────────────────────────────────────

export const PERFORMANCE_STYLES: Record<
  'high' | 'medium' | 'low',
  { bg: string; text: string; label: string }
> = {
  high: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'High Expected' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Medium Expected' },
  low: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'Low Expected' },
};

// ── Format helpers ───────────────────────────────────────────────

export function getThemeLabel(theme: AdGroupTheme): string {
  return AD_GROUP_THEME_LABELS[theme] ?? theme.replace(/_/g, ' ');
}

export function getBiddingLabel(strategy: BiddingStrategy): string {
  return BIDDING_STRATEGY_LABELS[strategy] ?? strategy;
}

export function getObjectiveLabel(objective: CampaignObjective): string {
  return CAMPAIGN_OBJECTIVE_LABELS[objective] ?? objective;
}

/** Format keyword with match type notation */
export function formatKeyword(text: string, matchType: KeywordMatchType): string {
  switch (matchType) {
    case 'EXACT':
      return `[${text}]`;
    case 'PHRASE':
      return `"${text}"`;
    case 'BROAD':
      return text;
  }
}

/** Count total keywords across all ad groups */
export function countTotalKeywords(adGroups: { keywords: { text: string }[] }[]): number {
  return adGroups.reduce((sum, ag) => sum + ag.keywords.length, 0);
}

/** Count keywords by match type across all ad groups */
export function countKeywordsByMatchType(
  adGroups: { keywords: { match_type: KeywordMatchType }[] }[]
): Record<KeywordMatchType, number> {
  const counts: Record<KeywordMatchType, number> = { EXACT: 0, PHRASE: 0, BROAD: 0 };
  for (const ag of adGroups) {
    for (const kw of ag.keywords) {
      counts[kw.match_type]++;
    }
  }
  return counts;
}
