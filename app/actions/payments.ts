'use server';

import { db } from '@/db';
import { paymentSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

async function checkAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Não autorizado');
}

export async function savePaymentSettings(formData: FormData) {
  try {
    await checkAdmin();

    const clientId = formData.get('clientId') as string;
    const clientSecret = formData.get('clientSecret') as string;
    const webhookSecret = formData.get('webhookSecret') as string;
    const environment = formData.get('environment') as 'sandbox' | 'production';

    if (!clientId || !clientSecret) {
      return { success: false, error: 'Client ID e Client Secret são obrigatórios.' };
    }

    const existing = await db.select().from(paymentSettings).where(eq(paymentSettings.provider, 'stylepay')).limit(1);

    if (existing.length > 0) {
      await db.update(paymentSettings).set({
        clientId,
        clientSecret,
        webhookSecret: webhookSecret || null,
        environment,
        updatedAt: new Date(),
      }).where(eq(paymentSettings.provider, 'stylepay'));
    } else {
      await db.insert(paymentSettings).values({
        id: crypto.randomUUID(),
        provider: 'stylepay',
        clientId,
        clientSecret,
        webhookSecret: webhookSecret || null,
        environment,
        isActive: true,
      });
    }

    revalidatePath('/admin/payments');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function testStylepayConnection(clientId: string, clientSecret: string, environment: string) {
  try {
    await checkAdmin();

    const baseUrl = environment === 'sandbox'
      ? 'https://sandbox.api.stylepay.com.br'
      : 'https://api.stylepay.com.br';

    // OAuth2 client_credentials token endpoint
    const tokenRes = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      return { success: false, error: `Falha na autenticação (${tokenRes.status}): ${errBody}` };
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return { success: false, error: 'Token não retornado. Verifique as credenciais.' };
    }

    return { success: true, message: 'Conexão com Stylepay estabelecida com sucesso!' };
  } catch (e: any) {
    return { success: false, error: `Erro de rede: ${e.message}` };
  }
}

export async function toggleStylepayActive(isActive: boolean) {
  try {
    await checkAdmin();
    await db.update(paymentSettings)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(paymentSettings.provider, 'stylepay'));
    revalidatePath('/admin/payments');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
