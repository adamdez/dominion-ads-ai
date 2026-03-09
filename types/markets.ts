export type Market = 'spokane' | 'kootenai';

export const MARKETS: readonly Market[] = ['spokane', 'kootenai'] as const;

export const MARKET_LABELS: Record<Market, string> = {
  spokane: 'Spokane County, WA',
  kootenai: 'Kootenai County / North Idaho',
};
