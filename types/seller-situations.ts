export type SellerSituation =
  | 'inherited'
  | 'probate'
  | 'tired_landlord'
  | 'tenant_issues'
  | 'major_repairs'
  | 'foundation_mold_damage'
  | 'divorce'
  | 'foreclosure'
  | 'relocation'
  | 'vacant_property'
  | 'low_intent'
  | 'unknown';

export const SELLER_SITUATIONS: readonly SellerSituation[] = [
  'inherited',
  'probate',
  'tired_landlord',
  'tenant_issues',
  'major_repairs',
  'foundation_mold_damage',
  'divorce',
  'foreclosure',
  'relocation',
  'vacant_property',
  'low_intent',
  'unknown',
] as const;

export const SELLER_SITUATION_LABELS: Record<SellerSituation, string> = {
  inherited: 'Inherited Property',
  probate: 'Probate / Estate',
  tired_landlord: 'Tired Landlord',
  tenant_issues: 'Tenant Issues',
  major_repairs: 'Major Repairs',
  foundation_mold_damage: 'Foundation / Mold / Damage',
  divorce: 'Divorce',
  foreclosure: 'Foreclosure / Pre-Foreclosure',
  relocation: 'Relocation',
  vacant_property: 'Vacant Property',
  low_intent: 'Low Intent / Exploring',
  unknown: 'Unknown',
};
