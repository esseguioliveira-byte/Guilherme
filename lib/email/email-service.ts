/**
 * EmailService — public facade for the email system.
 *
 * Usage:
 *   import { emailService } from '@/lib/email'
 *
 *   await emailService.sendEmail({ to, template: 'welcome', data: { name } })
 *   await emailService.sendEmailNow({ to, subject, html })
 */

import nodemailer from 'nodemailer';
import { getTransporter, verifyConnection, FROM_ADDRESS } from './transporter';
import {
  enqueueEmail,
  getEmailStatus,
  cancelEmail,
  retryDeadLetter,
  getQueueStats,
  type EnqueueOptions,
} from './queue';
import { renderTemplate } from './templates';

export type { EnqueueOptions };

class EmailService {
  /**
   * Adds an email to the persistent queue for async delivery.
   * Returns the job ID for status tracking.
   */
  async sendEmail(options: EnqueueOptions): Promise<string> {
    return enqueueEmail(options);
  }

  /**
   * Sends an email immediately, bypassing the queue.
   * Use for time-sensitive messages (OTP, emergency alerts).
   */
  async sendEmailNow(options: {
    to: string;
    subject?: string;
    html?: string;
    text?: string;
    template?: string;
    data?: Record<string, unknown>;
  }): Promise<void> {
    const transporter = getTransporter();

    let subject = options.subject ?? '';
    let html = options.html;
    let text = options.text;

    if (options.template && options.data) {
      const rendered = renderTemplate(options.template, options.data);
      if (rendered) {
        subject = rendered.subject;
        html = rendered.html;
        text = rendered.text;
      }
    }

    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: options.to,
      subject,
      html,
      text,
    });
  }

  /**
   * Returns the current status and metadata of a queued email.
   */
  async getEmailStatus(jobId: string) {
    return getEmailStatus(jobId);
  }

  /**
   * Cancels a PENDING email. Returns false if it's already been processed.
   */
  async cancelEmail(jobId: string): Promise<boolean> {
    return cancelEmail(jobId);
  }

  /**
   * Re-queues a dead-letter email. Returns the new job ID.
   */
  async retryDeadLetter(jobId: string): Promise<string | null> {
    return retryDeadLetter(jobId);
  }

  /**
   * Health check: verifies SMTP connection.
   */
  async isHealthy(): Promise<{ smtp: boolean; timestamp: string }> {
    const smtp = await verifyConnection();
    return { smtp, timestamp: new Date().toISOString() };
  }

  /**
   * Returns queue depth stats per status.
   */
  async getStats() {
    return getQueueStats();
  }
}

// Singleton instance
export const emailService = new EmailService();
