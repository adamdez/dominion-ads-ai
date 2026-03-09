import type { RiskLevel, RecommendationStatus } from '@/types/recommendations';

// ---------------------------------------------------------------------------
// Recommendation type display labels
// ---------------------------------------------------------------------------

export const RECOMMENDATION_TYPE_LABELS: Record<string, string> = {
  negative_keyword: 'Negative Keyword',
  new_keyword: 'New Keyword',
  landing_page_opportunity: 'Landing Page',
  waste_alert: 'Waste Alert',
  high_cost_waste_term: 'High-Cost Waste',
  new_campaign: 'New Campaign',
  geo_change: 'Geo Targeting',
  major_budget_change: 'Budget Change',
  bidding_strategy_change: 'Bidding Strategy',
};

export function getTypeLabel(type: string): string {
  return RECOMMENDATION_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

// ---------------------------------------------------------------------------
// Risk level styling
// ---------------------------------------------------------------------------

export const RISK_STYLES: Record<
  RiskLevel,
  { bg: string; text: string; border: string; glow: string; accent: string; label: string }
> = {
  green: {
    bg: 'bg-risk-green-bg',
    text: 'text-risk-green',
    border: 'border-risk-green-border',
    glow: 'glow-green',
    accent: 'bg-risk-green',
    label: 'Low Risk',
  },
  yellow: {
    bg: 'bg-risk-yellow-bg',
    text: 'text-risk-yellow',
    border: 'border-risk-yellow-border',
    glow: 'glow-yellow',
    accent: 'bg-risk-yellow',
    label: 'Moderate',
  },
  red: {
    bg: 'bg-risk-red-bg',
    text: 'text-risk-red',
    border: 'border-risk-red-border',
    glow: 'glow-red',
    accent: 'bg-risk-red',
    label: 'High Risk',
  },
};

// ---------------------------------------------------------------------------
// Status styling
// ---------------------------------------------------------------------------

export const STATUS_STYLES: Record<
  RecommendationStatus,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: 'bg-slate-400/10', text: 'text-status-pending', label: 'Pending' },
  approved: { bg: 'bg-emerald-400/10', text: 'text-status-approved', label: 'Approved' },
  testing: { bg: 'bg-violet-400/10', text: 'text-status-testing', label: 'Testing' },
  ignored: { bg: 'bg-gray-400/10', text: 'text-status-ignored', label: 'Ignored' },
  implemented: { bg: 'bg-cyan-400/10', text: 'text-status-implemented', label: 'Implemented' },
  expired: { bg: 'bg-stone-400/10', text: 'text-status-expired', label: 'Expired' },
};

// ---------------------------------------------------------------------------
// Market styling
// ---------------------------------------------------------------------------

export const MARKET_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  spokane: {
    bg: 'bg-market-spokane-bg',
    text: 'text-market-spokane',
    border: 'border-market-spokane-border',
    label: 'Spokane',
  },
  kootenai: {
    bg: 'bg-market-kootenai-bg',
    text: 'text-market-kootenai',
    border: 'border-market-kootenai-border',
    label: 'Kootenai',
  },
};

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}
