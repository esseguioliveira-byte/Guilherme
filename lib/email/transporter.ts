/**
 * EmailTransporter — Nodemailer SMTP pool with multi-provider support.
 * Credentials are NEVER logged.
 */

import nodemailer, { Transporter } from 'nodemailer';

export type EmailProvider = 'smtp' | 'sendgrid' | 'ses';

function buildTransporter(): Transporter {
  const provider = (process.env.EMAIL_PROVIDER ?? 'smtp') as EmailProvider;
  const poolSize = Number(process.env.EMAIL_POOL_SIZE ?? 5);

  if (provider === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      pool: true,
      maxConnections: poolSize,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  if (provider === 'ses') {
    return nodemailer.createTransport({
      host: process.env.SES_SMTP_HOST ?? 'email-smtp.us-east-1.amazonaws.com',
      port: 465,
      secure: true,
      pool: true,
      maxConnections: poolSize,
      auth: {
        user: process.env.SES_SMTP_USER,
        pass: process.env.SES_SMTP_PASS,
      },
    });
  }

  // Default: SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    pool: true,
    maxConnections: poolSize,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Singleton — created once per Node.js process
let _transporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (!_transporter) {
    _transporter = buildTransporter();
  }
  return _transporter;
}

/**
 * Verifies that the SMTP connection is alive.
 * Throws if the connection cannot be established.
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    await getTransporter().verify();
    return true;
  } catch {
    return false;
  }
}

export const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? 'Bahia Store <noreply@bahiastore.com>';
