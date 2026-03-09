import type { SellerSituation } from '@/types/seller-situations';
import { SELLER_SITUATION_LABELS } from '@/types/seller-situations';

interface SellerSituationTagProps {
  situation: SellerSituation | null;
}

export function SellerSituationTag({ situation }: SellerSituationTagProps) {
  if (!situation || situation === 'unknown') return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-600/60 px-2 py-0.5 text-xs text-text-secondary">
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-text-dim">
        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6a5 5 0 0110 0H3z" />
      </svg>
      {SELLER_SITUATION_LABELS[situation]}
    </span>
  );
}
