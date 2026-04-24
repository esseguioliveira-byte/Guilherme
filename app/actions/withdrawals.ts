'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { users, withdrawalRequests, affiliateTransactions } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

const MIN_WITHDRAWAL = 20; // R$20 mínimo

// ──────────────────────────────────────────────
// Affiliate: Request withdrawal
// ──────────────────────────────────────────────
export async function requestWithdrawal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Não autorizado.' };

  const amount    = parseFloat(formData.get('amount') as string);
  const pixKey    = (formData.get('pixKey') as string)?.trim();
  const pixKeyType = formData.get('pixKeyType') as 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';

  if (!amount || amount < MIN_WITHDRAWAL) {
    return { error: `O valor mínimo para saque é R$ ${MIN_WITHDRAWAL.toFixed(2)}.` };
  }
  if (!pixKey || !pixKeyType) {
    return { error: 'Informe a chave PIX e o tipo.' };
  }

  const user = await db.select().from(users)
    .where(eq(users.id, session.user.id))
    .then(r => r[0]);

  if (!user?.isAffiliate) return { error: 'Conta não é afiliada.' };

  const balance = parseFloat(user.balance as string);
  if (amount > balance) {
    return { error: `Saldo insuficiente. Seu saldo é R$ ${balance.toFixed(2)}.` };
  }

  // Check if already has a PENDING request
  const pending = await db.select().from(withdrawalRequests)
    .where(and(
      eq(withdrawalRequests.affiliateId, user.id),
      eq(withdrawalRequests.status, 'PENDING')
    ))
    .then(r => r[0]);

  if (pending) {
    return { error: 'Você já possui um saque pendente. Aguarde a aprovação.' };
  }

  // Deduct balance immediately (held in escrow until admin approves/rejects)
  const newBalance = (balance - amount).toFixed(2);
  await db.update(users).set({ balance: newBalance }).where(eq(users.id, user.id));

  // Create withdrawal request
  await db.insert(withdrawalRequests).values({
    id: randomUUID(),
    affiliateId: user.id,
    amount: amount.toFixed(2),
    pixKey,
    pixKeyType,
    status: 'PENDING',
  });

  revalidatePath('/affiliates/dashboard');
  return { success: true, message: 'Solicitação enviada! Aguarde aprovação em até 48h.' };
}

// ──────────────────────────────────────────────
// Admin: Approve withdrawal
// ──────────────────────────────────────────────
export async function approveWithdrawal(id: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') return { error: 'Sem permissão.' };

  const request = await db.select().from(withdrawalRequests)
    .where(eq(withdrawalRequests.id, id))
    .then(r => r[0]);

  if (!request) return { error: 'Solicitação não encontrada.' };
  if (request.status !== 'PENDING') return { error: 'Solicitação já foi processada.' };

  // Mark as approved
  await db.update(withdrawalRequests).set({
    status: 'APPROVED',
    resolvedAt: new Date(),
  }).where(eq(withdrawalRequests.id, id));

  // Create transaction log
  await db.insert(affiliateTransactions).values({
    id: randomUUID(),
    affiliateId: request.affiliateId,
    amount: request.amount,
    type: 'WITHDRAWAL',
    description: `Saque PIX aprovado — chave: ${request.pixKey}`,
  });

  revalidatePath('/admin/withdrawals');
  return { success: true };
}

// ──────────────────────────────────────────────
// Admin: Reject withdrawal (refunds balance)
// ──────────────────────────────────────────────
export async function rejectWithdrawal(id: string, note: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') return { error: 'Sem permissão.' };

  const request = await db.select().from(withdrawalRequests)
    .where(eq(withdrawalRequests.id, id))
    .then(r => r[0]);

  if (!request) return { error: 'Solicitação não encontrada.' };
  if (request.status !== 'PENDING') return { error: 'Solicitação já foi processada.' };

  // Refund the held amount back to user's balance
  const user = await db.select().from(users)
    .where(eq(users.id, request.affiliateId))
    .then(r => r[0]);

  if (user) {
    const refunded = (parseFloat(user.balance as string) + parseFloat(request.amount as string)).toFixed(2);
    await db.update(users).set({ balance: refunded }).where(eq(users.id, user.id));
  }

  await db.update(withdrawalRequests).set({
    status: 'REJECTED',
    adminNote: note || 'Rejeitado pelo administrador.',
    resolvedAt: new Date(),
  }).where(eq(withdrawalRequests.id, id));

  revalidatePath('/admin/withdrawals');
  return { success: true };
}
