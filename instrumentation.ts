/**
 * Next.js Instrumentation Hook — bootstraps the email worker system.
 */

export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Skip if SMTP is not configured
  if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY && !process.env.SES_SMTP_HOST) {
    console.warn('[EmailSystem] ⚠️  No email provider configured — workers not started.');
    return;
  }

  // Dynamically import the bootstrap logic to isolate Node-only APIs from Edge analyzer
  const { bootstrapEmailSystem } = await import('@/lib/email/bootstrap');
  await bootstrapEmailSystem();
}
