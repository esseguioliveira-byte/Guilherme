'use server';

import { db } from '@/db';
import { coupons } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Não autorizado');
}

// Validate a coupon code against an order total — used at checkout
export async function validateCoupon(code: string, orderTotal: number) {
  try {
    if (!code.trim()) return { success: false, error: 'Informe um código de cupom.' };

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase().trim()));

    if (!coupon) return { success: false, error: 'Cupom não encontrado.' };
    if (!coupon.isActive) return { success: false, error: 'Este cupom está inativo.' };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { success: false, error: 'Este cupom expirou.' };
    }
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      return { success: false, error: 'Este cupom atingiu o limite de usos.' };
    }
    if (orderTotal < Number(coupon.minOrderAmount)) {
      return {
        success: false,
        error: `Valor mínimo para este cupom: R$ ${Number(coupon.minOrderAmount).toFixed(2).replace('.', ',')}.`,
      };
    }

    const discount =
      coupon.type === 'PERCENTAGE'
        ? (orderTotal * Number(coupon.value)) / 100
        : Math.min(Number(coupon.value), orderTotal);

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        discount: parseFloat(discount.toFixed(2)),
      },
    };
  } catch (e: any) {
    return { success: false, error: 'Erro ao validar cupom.' };
  }
}

// Increment usage after a successful order
export async function consumeCoupon(couponId: string) {
  await db
    .update(coupons)
    .set({ currentUses: sql`${coupons.currentUses} + 1` })
    .where(eq(coupons.id, couponId));
}

// Admin: create coupon
export async function createCoupon(formData: FormData) {
  await checkAdmin();
  const code = (formData.get('code') as string).toUpperCase().trim();
  const type = formData.get('type') as 'PERCENTAGE' | 'FIXED';
  const value = formData.get('value') as string;
  const minOrderAmount = (formData.get('minOrderAmount') as string) || '0';
  const maxUses = formData.get('maxUses') as string;
  const expiresAt = formData.get('expiresAt') as string;

  if (!code || !value) throw new Error('Código e valor são obrigatórios.');

  await db.insert(coupons).values({
    id: crypto.randomUUID(),
    code,
    type,
    value,
    minOrderAmount,
    maxUses: maxUses ? parseInt(maxUses) : null,
    isActive: true,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  revalidatePath('/admin/coupons');
}

// Admin: toggle active state
export async function toggleCoupon(id: string, isActive: boolean) {
  await checkAdmin();
  await db.update(coupons).set({ isActive }).where(eq(coupons.id, id));
  revalidatePath('/admin/coupons');
}

// Admin: delete coupon
export async function deleteCoupon(id: string) {
  await checkAdmin();
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath('/admin/coupons');
}
