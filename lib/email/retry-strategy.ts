/**
 * RetryStrategy — Pure exponential backoff with random jitter.
 * No database dependency — fully testable in isolation.
 *
 * Formula: delay = BASE_DELAY * (2 ^ attempts) + jitter
 * Example (BASE_DELAY=30s): 30s → 60s → 120s → 240s → 480s
 */

const DEFAULT_BASE_DELAY_MS = Number(process.env.EMAIL_RETRY_BASE_MS ?? 30_000);
const DEFAULT_MAX_ATTEMPTS = Number(process.env.EMAIL_MAX_ATTEMPTS ?? 5);

/**
 * Calculates the next retry timestamp.
 * @param attempts - number of attempts already made (0-indexed)
 * @param baseDelayMs - base delay in ms (default: EMAIL_RETRY_BASE_MS env var)
 * @returns Date at which the next attempt should occur
 */
export function calculateNextRetry(
  attempts: number,
  baseDelayMs: number = DEFAULT_BASE_DELAY_MS,
): Date {
  // Cap exponent to avoid overflow
  const exp = Math.min(attempts, 10);
  const exponentialMs = baseDelayMs * Math.pow(2, exp);
  // Jitter: ±20% of the base delay to spread workers
  const jitterMs = Math.floor(Math.random() * baseDelayMs * 0.4) - baseDelayMs * 0.2;
  const delayMs = Math.max(1000, exponentialMs + jitterMs);
  return new Date(Date.now() + delayMs);
}

/**
 * Returns true when the job should be moved to dead letter.
 */
export function shouldDeadLetter(
  attempts: number,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
): boolean {
  return attempts >= maxAttempts;
}

/**
 * Computes a human-readable delay string for logs.
 */
export function formatDelayMs(ms: number): string {
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3_600_000) return `${(ms / 60_000).toFixed(1)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}
