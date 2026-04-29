/**
 * Template registry — maps template names to renderer functions.
 * Each renderer receives typed `data` and returns { subject, html, text }.
 */

import { welcomeTemplate } from './welcome';
import { orderConfirmedTemplate } from './order-confirmed';
import { orderCancelledTemplate } from './order-cancelled';
import { affiliateCommissionTemplate } from './affiliate-commission';
import {
  withdrawalSubmittedTemplate,
  withdrawalApprovedTemplate,
  withdrawalRejectedTemplate,
} from './withdrawals';
import {
  adminNewOrderTemplate,
  adminWithdrawalRequestTemplate,
} from './admin-notifications';

export type TemplateResult = {
  subject: string;
  html: string;
  text: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TemplateFn = (data: any) => TemplateResult;

const templates: Record<string, TemplateFn> = {
  welcome: welcomeTemplate,
  'order-confirmed': orderConfirmedTemplate,
  'order-cancelled': orderCancelledTemplate,
  'affiliate-commission': affiliateCommissionTemplate,
  'withdrawal-submitted': withdrawalSubmittedTemplate,
  'withdrawal-approved': withdrawalApprovedTemplate,
  'withdrawal-rejected': withdrawalRejectedTemplate,
  'admin-new-order': adminNewOrderTemplate,
  'admin-withdrawal-request': adminWithdrawalRequestTemplate,
};

export function renderTemplate(
  templateName: string,
  data: Record<string, unknown>,
): TemplateResult | null {
  const fn = templates[templateName];
  if (!fn) return null;
  return fn(data);
}

export const TEMPLATE_NAMES = Object.keys(templates) as (keyof typeof templates)[];
