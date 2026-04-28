'use server';

import crypto from 'crypto';
import { db } from '@/db';
import { orders, orderItems, products, users, affiliateTransactions, coupons } from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { auth } from '@/auth';
import { consumeCoupon, validateCoupon } from './coupons';
import { generateStylepayPixQrCode } from '@/lib/stylepay';

interface CartItemInput {
  productId: string;
  quantity: number;
}

export async function processCartPurchase(items: CartItemInput[], couponCode?: string, deliveryEmail?: string) {
  console.log('[Checkout] Iniciando processamento do carrinho...', { itemsCount: items?.length, couponCode });
  try {
    if (!items || items.length === 0) {
      return { success: false, error: 'Carrinho vazio.' };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Você precisa estar logado para comprar.' };
    }

    // Zero Trust: Fetch fresh user data from DB
    const currentUser = await db.select().from(users).where(eq(users.id, session.user.id)).then(res => res[0]);
    if (!currentUser) return { success: false, error: 'Usuário não encontrado.' };

    const productIds = items.map(i => i.productId);
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));

    if (dbProducts.length !== productIds.length) {
      return { success: false, error: 'Alguns produtos não estão mais disponíveis.' };
    }

    let totalAmount = 0;
    const finalItemsToInsert: any[] = [];

    for (const item of items) {
      const product = dbProducts.find(p => p.id === item.productId);
      if (!product) continue;

      if (product.stock < item.quantity) {
        return { success: false, error: `Estoque insuficiente para: ${product.name}` };
      }

      const price = Number(product.price);
      totalAmount += price * item.quantity;

      finalItemsToInsert.push({
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: price.toString(),
        unitPrice: price,
        productStockLeft: product.stock - item.quantity,
      });
    }

    const orderId = crypto.randomUUID();

    // Apply coupon discount if provided
    let discountAmount = 0;
    let appliedCoupon: { id: string; code: string; discount: number } | null = null;
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, totalAmount);
      if (!couponResult.success || !couponResult.coupon) {
        return { success: false, error: couponResult.error || 'Cupom inválido.' };
      }
      discountAmount = couponResult.coupon.discount;
      appliedCoupon = { id: couponResult.coupon.id, code: couponResult.coupon.code, discount: discountAmount };
    }

    const finalTotal = Number(Math.max(0, totalAmount - discountAmount).toFixed(2));

    // Build app base URL for webhook postback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || process.env.APP_URL || 'https://sualoja.com';
    const postbackUrl = `${appUrl}/api/webhooks/stylepay`;

    // Call Stylepay API to generate real PIX QR Code
    console.log('[Checkout] Montando payload para a Stylepay...', { amount: finalTotal, orderId });
    const stylepayResult = await generateStylepayPixQrCode({
      amount: finalTotal,
      external_id: orderId,
      payer: {
        name: currentUser.name || 'Cliente',
        // For digital products we use placeholder data — Stylepay requires valid formats
        document: '12345678909', // Valid-looking placeholder (or collect from user)
        phoneNumber: '11999999999', // Valid format required by Stylepay
        email: deliveryEmail || currentUser.email,
        address: {
          street: 'Rua Digital',
          number: '0',
          neighborhood: 'Centro',
          city: 'Salvador',
          state: 'BA',
          zipCode: '40000000',
        },
      },
      payerQuestion: `Pedido #${orderId.slice(0, 8).toUpperCase()} — Bahia Store`,
      postbackUrl,
      products: finalItemsToInsert.map(item => ({
        name: item.productName,
        quantity: String(item.quantity),
        price: item.unitPrice,
      })),
    });

    if (!stylepayResult.success) {
      console.error('[Checkout] Falha ao gerar QR Code na Stylepay:', stylepayResult.error);
      return { success: false, error: stylepayResult.error };
    }

    const { payment_id, qrcode, qrcode_image } = stylepayResult.data;
    console.log('[Checkout] QR Code gerado com sucesso! Payment ID:', payment_id, 'Iniciando transação de BD...');

    // Atomic Transaction — insert everything at once
    await db.transaction(async (tx) => {
      // 1. O estoque não será reduzido aqui, apenas quando o webhook confirmar o pagamento (PAID).

      // 2. Insert Order (PENDING — Stylepay webhook will flip to PAID)
      await tx.insert(orders).values({
        id: orderId,
        userId: currentUser.id,
        status: 'PENDING',
        totalAmount: finalTotal.toString(),
        pixCode: qrcode,
        stylepayPaymentId: payment_id,
        pixQrcodeImage: qrcode_image,
        deliveryEmail: deliveryEmail || currentUser.email,
      });

      // 3. Insert Items
      for (const item of finalItemsToInsert) {
        await tx.insert(orderItems).values({
          id: item.id,
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      // 4. Affiliate Commission Logic (Zero Trust)
      if (currentUser.referredBy) {
        const affiliate = await tx.select().from(users).where(eq(users.id, currentUser.referredBy)).then(res => res[0]);

        if (affiliate && affiliate.id !== currentUser.id) {
          const commissionAmount = (totalAmount * Number(affiliate.commissionRate)) / 100;

          if (commissionAmount > 0) {
            await tx.update(users)
              .set({ balance: sql`${users.balance} + ${commissionAmount.toFixed(2)}` })
              .where(eq(users.id, affiliate.id));

            await tx.insert(affiliateTransactions).values({
              id: crypto.randomUUID(),
              affiliateId: affiliate.id,
              orderId,
              amount: commissionAmount.toFixed(2),
              type: 'COMMISSION',
              description: `Comissão da venda #${orderId.slice(0, 8)} (Ref: ${currentUser.name})`,
            });
          }
        }
      }
    });

    console.log('[Checkout] Transação atômica concluída com sucesso para o pedido:', orderId);

    // Consume coupon after successful transaction
    if (appliedCoupon) {
      await consumeCoupon(appliedCoupon.id);
    }

    return {
      success: true,
      orderId,
      pixCode: qrcode,
      pixQrcodeImage: qrcode_image,
      stylepayPaymentId: payment_id,
      discountAmount,
      finalTotal,
    };
  } catch (error) {
    console.error('Erro no checkout de carrinho:', error);
    return { success: false, error: 'Erro inesperado no checkout.' };
  }
}
