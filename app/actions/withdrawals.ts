'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { users, withdrawalRequests, affiliateTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { emailService } from '@/lib/email';

const MIN_WITHDRAWAL = 20; // R$20 mínimo

// ──────────────────────────────────────────────
// Affiliate: Request withdrawal
// ──────────────────────────────────────────────
export async function requestWithdrawal(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Não autorizado. Faça login novamente.' };

    const amountRaw = formData.get('amount') as string;
    const amount = parseFloat(amountRaw);
    const pixKey = (formData.get('pixKey') as string)?.trim();
    const pixKeyType = formData.get('pixKeyType') as 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';

    if (isNaN(amount) || amount < MIN_WITHDRAWAL) {
      return { error: `O valor mínimo para saque é R$ ${MIN_WITHDRAWAL.toFixed(2).replace('.', ',')}.` };
    }
    if (!pixKey || !pixKeyType) {
      return { error: 'Informe a chave PIX e o tipo corretamente.' };
    }

    const userId = session.user.id;

    return await db.transaction(async (tx) => {
      // Fetch fresh user data within transaction
      const [user] = await tx.select().from(users)
        .where(eq(users.id, userId))
        .for('update'); // Lock row for update

      if (!user) return { error: 'Usuário não encontrado.' };
      if (!user.isAffiliate) return { error: 'Sua conta não está habilitada para o programa de afiliados.' };

      const balance = parseFloat(user.balance as string);
      if (amount > balance) {
        return { error: `Saldo insuficiente. Seu saldo disponível é R$ ${balance.toFixed(2).replace('.', ',')}.` };
      }

      // Check for pending requests
      const [pending] = await tx.select().from(withdrawalRequests)
        .where(and(
          eq(withdrawalRequests.affiliateId, user.id),
          eq(withdrawalRequests.status, 'PENDING')
        ));

      if (pending) {
        return { error: 'Você já possui uma solicitação de saque em análise. Aguarde a conclusão.' };
      }

      // 1. Deduct balance immediately
      const newBalance = (balance - amount).toFixed(2);
      await tx.update(users)
        .set({ balance: newBalance })
        .where(eq(users.id, user.id));

      // 2. Create the request record
      const withdrawalId = randomUUID();
      await tx.insert(withdrawalRequests).values({
        id: withdrawalId,
        affiliateId: user.id,
        amount: amount.toFixed(2),
        pixKey,
        pixKeyType,
        status: 'PENDING',
      });

      // ── Email: Confirmação de saque (non-blocking) ───────────────────────────
      emailService.sendEmail({
        to: user.email,
        template: 'withdrawal-submitted',
        data: {
          affiliateName: user.name ?? 'Afiliado',
          amount: amount.toFixed(2),
          pixKey,
          pixKeyType,
          requestId: withdrawalId,
        },
      }).catch(err => console.error('[Withdrawal] Submit email error:', err?.message));

      // Admin notification
      if (process.env.ADMIN_EMAIL) {
        emailService.sendEmail({
          to: process.env.ADMIN_EMAIL,
          template: 'admin-withdrawal-request',
          data: {
            affiliateName: user.name ?? 'Afiliado',
            affiliateEmail: user.email,
            amount: amount.toFixed(2),
            pixKey,
            pixKeyType,
            requestId: withdrawalId,
          },
        }).catch(err => console.error('[Withdrawal] Admin email error:', err?.message));
      }

      return { success: true, message: 'Solicitação realizada com sucesso! O valor será enviado para sua chave PIX em até 48h úteis.' };
    });
  } catch (error: any) {
    console.error('[RequestWithdrawal] Error:', error);
    return { error: 'Ocorreu um erro interno ao processar seu saque. Tente novamente mais tarde.' };
  } finally {
    revalidatePath('/affiliates/dashboard');
  }
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

  // ── Email: Saque aprovado ────────────────────────────────────────────
  try {
    const affiliate = await db.select().from(users).where(eq(users.id, request.affiliateId)).then(r => r[0]);
    if (affiliate) {
      await emailService.sendEmail({
        to: affiliate.email,
        template: 'withdrawal-approved',
        data: {
          affiliateName: affiliate.name ?? 'Afiliado',
          amount: String(request.amount),
          pixKey: request.pixKey,
          requestId: request.id,
        },
      });
    }
  } catch (emailErr: any) {
    console.error('[Withdrawal] Approval email error:', emailErr?.message);
  }

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

  // ── Email: Saque rejeitado ─────────────────────────────────────────────
  try {
    const affiliate = await db.select().from(users).where(eq(users.id, request.affiliateId)).then(r => r[0]);
    if (affiliate) {
      await emailService.sendEmail({
        to: affiliate.email,
        template: 'withdrawal-rejected',
        data: {
          affiliateName: affiliate.name ?? 'Afiliado',
          amount: String(request.amount),
          requestId: request.id,
          adminNote: note || undefined,
        },
      });
    }
  } catch (emailErr: any) {
    console.error('[Withdrawal] Rejection email error:', emailErr?.message);
  }

  revalidatePath('/admin/withdrawals');
  return { success: true };
}
