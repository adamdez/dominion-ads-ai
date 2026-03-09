/**
 * Offline conversion feedback — future implementation.
 *
 * This module will format deal-stage transitions into conversion events
 * that can be uploaded back to Google Ads via the Conversion Upload API.
 *
 * Requires:
 * - gclid captured at lead intake
 * - deal reaching a target stage (qualified, appointment, contract, closed)
 * - Google Ads API credentials with conversion upload permissions
 *
 * Not implemented yet — the schema and attribution layer support it.
 */

import type { DealStage } from '../../types/deals';

export interface OfflineConversionEvent {
  gclid: string;
  conversion_action: string;
  conversion_date_time: string;
  conversion_value?: number;
}

export const STAGE_TO_CONVERSION_ACTION: Partial<Record<DealStage, string>> = {
  qualified: 'qualified_lead',
  appointment: 'appointment_set',
  contract: 'contract_signed',
  closed: 'deal_closed',
};
