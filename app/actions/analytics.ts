'use server';

import { db } from '@/db';
import { siteVisits } from '@/db/schema';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function trackVisit() {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = headerList.get('user-agent') || 'unknown';

  // Check if tracked recently (optional, but let's keep it simple)
  await db.insert(siteVisits).values({
    id: crypto.randomUUID(),
    ip,
    userAgent
  });
}
