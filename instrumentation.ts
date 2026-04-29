/**
 * Next.js Instrumentation Hook — bootstraps the email worker system.
 *
 * This file is loaded ONCE by the Next.js server on startup (Node.js runtime only).
 * It starts the email workers and registers graceful shutdown handlers.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Skip if SMTP is not configured (avoids crashing in bare deployments)
  if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY && !process.env.SES_SMTP_HOST) {
    console.warn('[EmailSystem] ⚠️  No email provider configured — workers not started. Set SMTP_HOST (or SENDGRID_API_KEY / SES_SMTP_HOST) in .env');
    return;
  }

  const { startWorkers, resetStuckJobs } = await import('@/lib/email');

  const workerCount = Number(process.env.EMAIL_WORKERS ?? 5);

  console.log('[EmailSystem] 🔧 Initializing email worker system...');

  // Recover any jobs stuck as PROCESSING from a previous crash
  await resetStuckJobs();

  // Start all workers concurrently
  const { shutdown } = startWorkers(workerCount);

  // Graceful shutdown
  const handleShutdown = async () => {
    console.log('[EmailSystem] 📴 Shutdown signal received — stopping workers...');
    await shutdown();
    process.exit(0);
  };

  process.once('SIGTERM', handleShutdown);
  process.once('SIGINT', handleShutdown);

  console.log(`[EmailSystem] ✅ ${workerCount} worker(s) running — queue polling every ${process.env.EMAIL_POLL_MS ?? 500}ms`);
}
