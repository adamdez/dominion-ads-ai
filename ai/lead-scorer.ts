import type { Lead } from '../types/leads';
import type { ClassificationResult } from './seller-situation-classifier';

export interface LeadScore {
  lead_score: number;
  motivation_score: number;
  urgency_score: number;
  deal_probability: number;
}

/**
 * Estimates deal probability from lead data and seller situation classification.
 *
 * Phase 6 feature — scoring logic will improve as deal outcome data accumulates.
 * Initial version uses seller situation urgency and source quality as signals.
 */
export function scoreLead(
  lead: Pick<Lead, 'source' | 'market' | 'seller_situation'>,
  classification?: ClassificationResult
): LeadScore {
  let motivation = 50;
  let urgency = 50;

  if (classification) {
    if (classification.urgency_hint === 'high') {
      motivation += 25;
      urgency += 30;
    } else if (classification.urgency_hint === 'medium') {
      motivation += 15;
      urgency += 10;
    }

    motivation = Math.round(motivation * classification.confidence);
  }

  if (lead.seller_situation === 'low_intent') {
    motivation = Math.max(motivation - 30, 5);
    urgency = Math.max(urgency - 30, 5);
  }

  const leadScore = Math.round((motivation + urgency) / 2);
  const dealProbability = Math.min(leadScore / 100, 0.95);

  return {
    lead_score: Math.min(leadScore, 100),
    motivation_score: Math.min(motivation, 100),
    urgency_score: Math.min(urgency, 100),
    deal_probability: Math.round(dealProbability * 1000) / 1000,
  };
}
