import type { SellerSituation } from '../types/seller-situations';

export interface ClassificationResult {
  situation: SellerSituation;
  confidence: number;
  urgency_hint: 'high' | 'medium' | 'low';
  follow_up_priority: number;
}

/**
 * Classifies a piece of text (search term, form submission, call notes)
 * into a seller situation category.
 *
 * Uses keyword matching as a baseline. Can be upgraded to ML/LLM later.
 */
export function classifySellerSituation(text: string): ClassificationResult {
  const lower = text.toLowerCase();

  const patterns: { pattern: RegExp; situation: SellerSituation; urgency: ClassificationResult['urgency_hint'] }[] = [
    { pattern: /inherit|inherited|heir/, situation: 'inherited', urgency: 'medium' },
    { pattern: /probate|estate|executor|deceased/, situation: 'probate', urgency: 'medium' },
    { pattern: /landlord|rental.*sell|tired.*rent/, situation: 'tired_landlord', urgency: 'medium' },
    { pattern: /tenant|evict|renter.*problem/, situation: 'tenant_issues', urgency: 'medium' },
    { pattern: /repair|fix.*up|fixer|handyman/, situation: 'major_repairs', urgency: 'low' },
    { pattern: /foundation|mold|flood|fire.*damage|water.*damage/, situation: 'foundation_mold_damage', urgency: 'high' },
    { pattern: /divorce|divorcing|splitting/, situation: 'divorce', urgency: 'high' },
    { pattern: /foreclos|pre.?foreclos|behind.*payment|bank.*own/, situation: 'foreclosure', urgency: 'high' },
    { pattern: /relocat|moving|transfer|out.*state/, situation: 'relocation', urgency: 'medium' },
    { pattern: /vacant|empty.*house|abandoned/, situation: 'vacant_property', urgency: 'low' },
  ];

  for (const { pattern, situation, urgency } of patterns) {
    if (pattern.test(lower)) {
      return {
        situation,
        confidence: 0.7,
        urgency_hint: urgency,
        follow_up_priority: urgency === 'high' ? 1 : urgency === 'medium' ? 2 : 3,
      };
    }
  }

  if (/sell.*house|sell.*home|buy.*house|cash.*offer|we.*buy/.test(lower)) {
    return { situation: 'unknown', confidence: 0.3, urgency_hint: 'low', follow_up_priority: 4 };
  }

  return { situation: 'low_intent', confidence: 0.5, urgency_hint: 'low', follow_up_priority: 5 };
}
