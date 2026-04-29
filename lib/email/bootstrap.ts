import { startWorkers, resetStuckJobs } from './index';

/**
 * Bootstraps the email worker system for Node.js environments.
 * Handles stuck job recovery and graceful shutdown via process signals.
 */
export async function bootstrapEmailSystem() {
  const workerCount = Number(process.env.EMAIL_WORKERS ?? 5);

  console.log('[EmailSystem] 🔧 Initializing email worker system...');

  // Recover any jobs stuck as PROCESSING from a previous crash
  await resetStuckJobs();

  // Start all workers concurrently
  const { shutdown } = startWorkers(workerCount);

  // Graceful shutdown handler
  const handleShutdown = async () => {
    console.log('[EmailSystem] 📴 Shutdown signal received — stopping workers...');
    await shutdown();
    // We don't necessarily want to process.exit(0) here if this is part of 
    // a larger process that Next.js is managing, but SIGTERM/SIGINT 
    // usually mean the process is dying anyway.
    // However, to satisfy the Edge analyzer, we use global access if needed,
    // but in this file it's safe because it's only imported by the Node runtime.
    process.exit(0);
  };

  process.once('SIGTERM', handleShutdown);
  process.once('SIGINT', handleShutdown);

  console.log(`[EmailSystem] ✅ ${workerCount} worker(s) running — queue polling every ${process.env.EMAIL_POLL_MS ?? 500}ms`);
}
