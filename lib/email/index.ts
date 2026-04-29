/**
 * lib/email — Public re-exports.
 *
 * Import from here, not from individual modules:
 *   import { emailService } from '@/lib/email'
 */

export { emailService } from './email-service';
export type { EnqueueOptions } from './email-service';
export { startWorkers, getMetrics } from './worker';
export { resetStuckJobs, getQueueStats } from './queue';
export { verifyConnection } from './transporter';
export { renderTemplate, TEMPLATE_NAMES } from './templates';
