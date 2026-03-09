import type { SellerSituation } from '../types/seller-situations';

export interface ClassificationResult {
  situation: SellerSituation;
  confidence: number;
  urgency_hint: 'high' | 'medium' | 'low';
  follow_up_priority: number;
}

interface SituationPattern {
  pattern: RegExp;
  situation: SellerSituation;
  urgency: ClassificationResult['urgency_hint'];
  confidence: number;
}

const SITUATION_PATTERNS: SituationPattern[] = [
  // Inherited — medium urgency, often unsure what to do with property
  { pattern: /inherit|inherited|heir|left\s+me\s+(a\s+)?house/, situation: 'inherited', urgency: 'medium', confidence: 0.8 },

  // Probate / estate — medium urgency, legal process creates timeline pressure
  { pattern: /probate|estate\s+sale|executor|deceased|passed\s+away|death\s+in\s+family/, situation: 'probate', urgency: 'medium', confidence: 0.8 },

  // Tired landlord — medium urgency, chronic pain point
  { pattern: /tired\s+(of\s+)?(being\s+)?(a\s+)?landlord|sell\s+(my\s+)?rental|don'?t\s+want\s+tenants|bad\s+renters|rental\s+property\s+sell/, situation: 'tired_landlord', urgency: 'medium', confidence: 0.75 },

  // Tenant issues — medium-high urgency, active problem
  { pattern: /tenant\s+(not\s+paying|problem|issue|damage|won'?t\s+leave)|evict|sell\s+(house|home)\s+with\s+tenants|problem\s+tenant|renter\s+damage/, situation: 'tenant_issues', urgency: 'medium', confidence: 0.75 },

  // Foundation / mold / major damage — high urgency, expensive problem
  { pattern: /foundation\s+(issue|problem|crack|damage|repair)|mold|flood\s+damage|fire\s+damage|water\s+damage|storm\s+damage|sinkhole|structural\s+damage/, situation: 'foundation_mold_damage', urgency: 'high', confidence: 0.8 },

  // Major repairs — low-medium urgency, costly but less time-sensitive
  { pattern: /need(s)?\s+(major\s+)?repair|fixer\s+upper|sell\s+(house|home)\s+as\s+is|handyman\s+special|too\s+much\s+to\s+fix|can'?t\s+afford\s+(to\s+)?fix|sell\s+(damaged|ugly)|condemned/, situation: 'major_repairs', urgency: 'low', confidence: 0.7 },

  // Divorce — high urgency, legal timeline pressure
  { pattern: /divorce|divorcing|split(ting)?\s+(up|asset)|marital\s+property|ex\s+(wife|husband|spouse)/, situation: 'divorce', urgency: 'high', confidence: 0.85 },

  // Foreclosure — high urgency, hard deadline
  { pattern: /foreclos|pre[\s-]?foreclos|behind\s+on\s+(mortgage|payment)|can'?t\s+(make|afford)\s+(mortgage|payment)|bank\s+own|short\s+sale|stop\s+foreclosure|avoid\s+foreclosure|facing\s+foreclosure|save\s+my\s+home/, situation: 'foreclosure', urgency: 'high', confidence: 0.85 },

  // Relocation — medium urgency, job/life timeline
  { pattern: /relocat|moving\s+(out\s+of|away)|transfer(ring)?|out\s+of\s+state|leaving\s+town|military\s+move|pcs\s+move|job\s+transfer|sell\s+house\s+fast\s+moving/, situation: 'relocation', urgency: 'medium', confidence: 0.7 },

  // Vacant property — low urgency but clear motivation
  { pattern: /vacant\s+(house|home|property|lot)|empty\s+(house|home|property)|abandoned\s+(house|home|property)|no\s+one\s+living|sitting\s+empty/, situation: 'vacant_property', urgency: 'low', confidence: 0.75 },
];

/**
 * Classifies a piece of text (search term, form submission, call notes)
 * into a seller situation category.
 *
 * Rules-based pattern matching. Patterns are ordered by specificity
 * so the first match wins. Can be upgraded to ML/LLM later.
 */
export function classifySellerSituation(text: string): ClassificationResult {
  const lower = text.toLowerCase();

  for (const { pattern, situation, urgency, confidence } of SITUATION_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        situation,
        confidence,
        urgency_hint: urgency,
        follow_up_priority: urgency === 'high' ? 1 : urgency === 'medium' ? 2 : 3,
      };
    }
  }

  // Generic seller intent — wants to sell but no specific situation detected
  if (/sell\s+(my\s+)?(house|home|property)|cash\s+(home\s+)?buyer|we\s+buy|need\s+to\s+sell|companies?\s+that\s+buy/.test(lower)) {
    return { situation: 'unknown', confidence: 0.3, urgency_hint: 'low', follow_up_priority: 4 };
  }

  return { situation: 'low_intent', confidence: 0.5, urgency_hint: 'low', follow_up_priority: 5 };
}
