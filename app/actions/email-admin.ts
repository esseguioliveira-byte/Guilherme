'use server';

import { db } from '@/db';
import { emailQueue, deadLetterEmails } from '@/db/schema';
import { desc, eq, count, sql } from 'drizzle-orm';
import { auth } from '@/auth';

async function checkAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Não autorizado');
}

/**
 * Fetches the latest failed or dead-letter emails for admin review.
 */
export async function getEmailErrors(limit = 50) {
  await checkAdmin();

  const failedJobs = await db.select()
    .from(emailQueue)
    .where(sql`${emailQueue.status} IN ('FAILED', 'DEAD_LETTER')`)
    .orderBy(desc(emailQueue.createdAt))
    .limit(limit);

  const deadLetters = await db.select()
    .from(deadLetterEmails)
    .orderBy(desc(deadLetterEmails.createdAt))
    .limit(limit);

  return { failedJobs, deadLetters };
}

/**
 * Fetches summary stats for the email queue.
 */
export async function getEmailStats() {
  await checkAdmin();

  const stats = await db.select({
    status: emailQueue.status,
    count: count(),
  })
  .from(emailQueue)
  .groupBy(emailQueue.status);

  return stats;
}

/**
 * Retries a specific dead letter email.
 */
export async function retryEmail(id: string) {
  await checkAdmin();
  const { emailService } = await import('@/lib/email');
  return emailService.retryDeadLetter(id);
}

/**
 * Clears all dead letter emails (dangerous, but useful for cleanup).
 */
export async function clearDeadLetters() {
  await checkAdmin();
  await db.delete(deadLetterEmails);
  return { success: true };
}
