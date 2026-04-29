/**
 * EmailWorker — polls the email_queue and processes jobs concurrently.
 *
 * - N workers run in parallel, each polling independently.
 * - Claim logic uses FOR UPDATE SKIP LOCKED (in queue.ts) to avoid races.
 * - Supports graceful shutdown: finishes current job, then exits cleanly.
 * - Emits structured logs at every step.
 * - Enforces a per-email send timeout (EMAIL_SEND_TIMEOUT_MS).
 */

import { getTransporter, FROM_ADDRESS } from './transporter';
import { claimNextPendingJob, markAsSent, markAsFailed } from './queue';
import { renderTemplate } from './templates';

const POLL_MS = Number(process.env.EMAIL_POLL_MS ?? 500);
const SEND_TIMEOUT_MS = Number(process.env.EMAIL_SEND_TIMEOUT_MS ?? 10_000);
const RATE_LIMIT = Number(process.env.EMAIL_RATE_LIMIT ?? 14); // emails/second per worker

/** Metrics counters (in-memory, per-process) */
const metrics = {
  sent: 0,
  failed: 0,
  retried: 0,
  deadLettered: 0,
};

export function getMetrics() {
  return { ...metrics };
}

/**
 * Sends a single email with a configurable timeout.
 */
async function sendWithTimeout(
  to: string,
  subject: string,
  html?: string | null,
  text?: string | null,
): Promise<void> {
  const transporter = getTransporter();

  const sendPromise = transporter.sendMail({
    from: FROM_ADDRESS,
    to,
    subject,
    html: html ?? undefined,
    text: text ?? undefined,
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Send timeout after ${SEND_TIMEOUT_MS}ms`)),
      SEND_TIMEOUT_MS,
    ),
  );

  await Promise.race([sendPromise, timeoutPromise]);
}

/**
 * Processes one job from the queue.
 * Returns true if a job was processed, false if the queue was empty.
 */
async function processOneJob(workerId: number): Promise<boolean> {
  const job = await claimNextPendingJob();
  if (!job) return false;

  const startedAt = Date.now();
  console.log(`[Worker-${workerId}] 📨 Processing job ${job.id} → ${job.to} (attempt ${job.attempts + 1}/${job.maxAttempts})`);

  try {
    let subject = job.subject ?? '(no subject)';
    let html = job.html ?? null;
    let text = job.text ?? null;

    // Re-render template if content was stored as template+data
    if (job.template && job.data) {
      try {
        const data = JSON.parse(job.data) as Record<string, unknown>;
        const rendered = renderTemplate(job.template, data);
        if (rendered) {
          subject = rendered.subject;
          html = rendered.html;
          text = rendered.text;
        }
      } catch {
        // Fall back to stored html/text
      }
    }

    await sendWithTimeout(job.to, subject, html, text);

    await markAsSent(job.id);
    metrics.sent++;

    const durationMs = Date.now() - startedAt;
    console.log(`[Worker-${workerId}] ✅ Success: ${job.id} | Duration: ${durationMs}ms | To: ${job.to}`);

    // Rate limit: wait if needed
    if (durationMs < 1000 / RATE_LIMIT) {
      await new Promise((r) => setTimeout(r, 1000 / RATE_LIMIT - durationMs));
    }

    return true;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[Worker-${workerId}] ❌ Failed job ${job.id}: ${errorMessage}`);

    await markAsFailed(job.id, errorMessage);
    metrics.failed++;

    return true;
  }
}

/**
 * Single EmailWorker instance.
 */
export class EmailWorker {
  private readonly id: number;
  private running = false;
  private interval: ReturnType<typeof setInterval> | null = null;
  private activePoll: Promise<boolean> | null = null;

  constructor(id: number) {
    this.id = id;
  }

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    console.log(`[Worker-${this.id}] 🟢 Started (poll every ${POLL_MS}ms)`);

    this.interval = setInterval(async () => {
      if (this.activePoll) return; // Skip if previous poll not done
      this.activePoll = processOneJob(this.id).finally(() => {
        this.activePoll = null;
      });
    }, POLL_MS);
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // Wait for the current job to finish
    if (this.activePoll) {
      await this.activePoll.catch(() => {});
    }

    console.log(`[Worker-${this.id}] 🔴 Stopped`);
  }
}

/**
 * Starts N workers in parallel and returns a shutdown function.
 */
export function startWorkers(count: number): { workers: EmailWorker[]; shutdown: () => Promise<void> } {
  const workers = Array.from({ length: count }, (_, i) => new EmailWorker(i + 1));
  workers.forEach((w) => w.start());
  console.log(`[EmailSystem] 🚀 ${count} worker(s) started`);

  const shutdown = async () => {
    console.log('[EmailSystem] ⏳ Graceful shutdown — waiting for workers to finish...');
    await Promise.all(workers.map((w) => w.stop()));
    console.log('[EmailSystem] 🏁 All workers stopped');
  };

  return { workers, shutdown };
}
