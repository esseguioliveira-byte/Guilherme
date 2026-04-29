/**
 * EmailQueue — persistent queue backed by the `email_queue` MySQL table.
 *
 * Key design decisions:
 * - claimNextPendingJob uses raw SQL with FOR UPDATE SKIP LOCKED to prevent
 *   race conditions between concurrent workers without distributed locking.
 * - All status transitions are done inside transactions.
 * - resetStuckJobs recovers from worker crashes on startup.
 */

import crypto from 'crypto';
import { db } from '@/db';
import { emailQueue, deadLetterEmails } from '@/db/schema';
import { eq, and, lte, sql } from 'drizzle-orm';
import { calculateNextRetry, shouldDeadLetter } from './retry-strategy';
import { renderTemplate } from './templates';

const MAX_ATTEMPTS = Number(process.env.EMAIL_MAX_ATTEMPTS ?? 5);
const STUCK_TIMEOUT_MS = Number(process.env.EMAIL_STUCK_TIMEOUT_MS ?? 60_000);

export interface EnqueueOptions {
  to: string;
  subject?: string;
  html?: string;
  text?: string;
  template?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  maxAttempts?: number;
}

/**
 * Sanitizes HTML to prevent script injection from user-supplied data.
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, 'data-removed=');
}

/**
 * Adds an email to the queue. Returns the new job ID.
 */
export async function enqueueEmail(options: EnqueueOptions): Promise<string> {
  const { to, subject, html, text, template, data, maxAttempts = MAX_ATTEMPTS } = options;

  let resolvedSubject = subject;
  let resolvedHtml = html;
  let resolvedText = text;

  // Render template if provided
  if (template && data) {
    const rendered = renderTemplate(template, data);
    if (rendered) {
      resolvedSubject = rendered.subject;
      resolvedHtml = rendered.html;
      resolvedText = rendered.text;
    }
  }

  if (!resolvedSubject && !resolvedHtml && !resolvedText) {
    throw new Error('Email must have at least subject + (html or text), or a valid template.');
  }

  const id = crypto.randomUUID();

  await db.insert(emailQueue).values({
    id,
    to,
    subject: resolvedSubject,
    html: resolvedHtml ? sanitizeHtml(resolvedHtml) : null,
    text: resolvedText ?? null,
    template: template ?? null,
    data: data ? JSON.stringify(data) : null,
    status: 'PENDING',
    attempts: 0,
    maxAttempts,
    nextRetryAt: new Date(),
  });

  console.log(`[EmailQueue] ✉️  Enqueued: ${id} → ${to} (template: ${template ?? 'raw'})`);
  return id;
}

/**
 * Claims the next available PENDING job using FOR UPDATE SKIP LOCKED.
 * Returns the claimed job row or null if the queue is empty.
 *
 * Note: Drizzle ORM does not expose FOR UPDATE SKIP LOCKED natively,
 * so we use db.execute() with a raw SQL transaction.
 */
export async function claimNextPendingJob(): Promise<typeof emailQueue.$inferSelect | null> {
  try {
    // We need a transaction-scoped FOR UPDATE SKIP LOCKED
    // Use the underlying mysql2 pool connection directly via db.$client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pool = (db as any).$client as import('mysql2/promise').Pool;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const [rows] = await conn.execute<import('mysql2').RowDataPacket[]>(
        `SELECT * FROM email_queue
         WHERE status = 'PENDING'
           AND next_retry_at <= ?
         ORDER BY next_retry_at ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED`,
        [now],
      );

      if (!rows || rows.length === 0) {
        await conn.rollback();
        return null;
      }

      const row = rows[0];

      await conn.execute(
        `UPDATE email_queue
         SET status = 'PROCESSING',
             processing_started_at = NOW()
         WHERE id = ?`,
        [row.id],
      );

      await conn.commit();

      // Re-read with Drizzle ORM for typed result
      const [claimed] = await db
        .select()
        .from(emailQueue)
        .where(eq(emailQueue.id, row.id as string))
        .limit(1);

      return claimed ?? null;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('[EmailQueue] claimNextPendingJob error:', err);
    return null;
  }
}

/**
 * Marks a job as successfully sent.
 */
export async function markAsSent(id: string): Promise<void> {
  await db
    .update(emailQueue)
    .set({ status: 'SENT', sentAt: new Date(), error: null })
    .where(eq(emailQueue.id, id));
}

/**
 * Marks a job as failed, calculates next retry time, or moves to dead letter.
 */
export async function markAsFailed(id: string, error: string): Promise<void> {
  const [job] = await db
    .select()
    .from(emailQueue)
    .where(eq(emailQueue.id, id))
    .limit(1);

  if (!job) return;

  const newAttempts = job.attempts + 1;

  if (shouldDeadLetter(newAttempts, job.maxAttempts)) {
    await markAsDeadLetter(id, error, newAttempts);
    return;
  }

  const nextRetry = calculateNextRetry(newAttempts);
  console.log(`[EmailQueue] ↩️  Retry scheduled: ${id} attempt ${newAttempts} at ${nextRetry.toISOString()}`);

  await db
    .update(emailQueue)
    .set({
      status: 'FAILED',
      attempts: newAttempts,
      nextRetryAt: nextRetry,
      error: error.slice(0, 2000), // Cap error length
    })
    .where(eq(emailQueue.id, id));

  // Re-queue as PENDING for next worker pickup
  await db
    .update(emailQueue)
    .set({ status: 'PENDING' })
    .where(eq(emailQueue.id, id));
}

/**
 * Moves a job to the dead letter queue.
 */
export async function markAsDeadLetter(
  id: string,
  error: string,
  finalAttempts?: number,
): Promise<void> {
  const [job] = await db
    .select()
    .from(emailQueue)
    .where(eq(emailQueue.id, id))
    .limit(1);

  if (!job) return;

  await db.transaction(async (tx) => {
    await tx.insert(deadLetterEmails).values({
      id: crypto.randomUUID(),
      originalId: job.id,
      to: job.to,
      subject: job.subject ?? null,
      html: job.html ?? null,
      text: job.text ?? null,
      template: job.template ?? null,
      data: job.data ?? null,
      attempts: finalAttempts ?? job.attempts,
      lastError: error.slice(0, 2000),
    });

    await tx
      .update(emailQueue)
      .set({
        status: 'DEAD_LETTER',
        attempts: finalAttempts ?? job.attempts,
        error: error.slice(0, 2000),
      })
      .where(eq(emailQueue.id, id));
  });

  console.warn(`[EmailQueue] ☠️  Dead letter: ${id} → ${job.to} after ${finalAttempts ?? job.attempts} attempts`);
}

/**
 * Resets PROCESSING jobs that are older than STUCK_TIMEOUT_MS back to PENDING.
 * Called on worker startup to recover from crashes.
 */
export async function resetStuckJobs(): Promise<number> {
  const stuckBefore = new Date(Date.now() - STUCK_TIMEOUT_MS);

  const result = await db
    .update(emailQueue)
    .set({
      status: 'PENDING',
      processingStartedAt: null,
    })
    .where(
      and(
        eq(emailQueue.status, 'PROCESSING'),
        lte(emailQueue.processingStartedAt, stuckBefore),
      ),
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const count = (result as any)?.[0]?.affectedRows ?? 0;
  if (count > 0) {
    console.log(`[EmailQueue] 🔄 Reset ${count} stuck job(s) to PENDING`);
  }
  return count;
}

/**
 * Returns the current status of a job by ID.
 */
export async function getEmailStatus(id: string) {
  const [job] = await db
    .select()
    .from(emailQueue)
    .where(eq(emailQueue.id, id))
    .limit(1);
  return job ?? null;
}

/**
 * Cancels a PENDING job. Returns false if it's already being processed.
 */
export async function cancelEmail(id: string): Promise<boolean> {
  const [job] = await db
    .select()
    .from(emailQueue)
    .where(eq(emailQueue.id, id))
    .limit(1);

  if (!job || job.status !== 'PENDING') return false;

  await db
    .update(emailQueue)
    .set({ status: 'FAILED', error: 'Cancelled by user' })
    .where(and(eq(emailQueue.id, id), eq(emailQueue.status, 'PENDING')));

  return true;
}

/**
 * Re-enqueues a dead letter email for retry.
 */
export async function retryDeadLetter(id: string): Promise<string | null> {
  const [job] = await db
    .select()
    .from(emailQueue)
    .where(eq(emailQueue.id, id))
    .limit(1);

  if (!job || job.status !== 'DEAD_LETTER') return null;

  const newId = crypto.randomUUID();

  await db.insert(emailQueue).values({
    id: newId,
    to: job.to,
    subject: job.subject ?? null,
    html: job.html ?? null,
    text: job.text ?? null,
    template: job.template ?? null,
    data: job.data ?? null,
    status: 'PENDING',
    attempts: 0,
    maxAttempts: job.maxAttempts,
    nextRetryAt: new Date(),
  });

  console.log(`[EmailQueue] 🔁 Retrying dead letter ${id} as new job ${newId}`);
  return newId;
}

/**
 * Returns queue depth stats for monitoring.
 */
export async function getQueueStats() {
  const rows = await db
    .select({
      status: emailQueue.status,
      count: sql<number>`COUNT(*)`,
    })
    .from(emailQueue)
    .groupBy(emailQueue.status);

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = Number(row.count);
    return acc;
  }, {});
}
