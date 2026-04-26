import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentSettings, orders, stockItems } from '@/db/schema';
import { eq, sql, inArray } from 'drizzle-orm';
import crypto from 'crypto';

function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `sha256=${expected}` === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-stylepay-signature') ?? '';

    // Load active settings
    const [settings] = await db
      .select()
      .from(paymentSettings)
      .where(eq(paymentSettings.provider, 'stylepay'))
      .limit(1);

    if (!settings?.isActive) {
      return NextResponse.json({ error: 'Gateway inativo' }, { status: 403 });
    }

    // Validate HMAC signature if secret is configured
    if (settings.webhookSecret && signature) {
      const valid = validateWebhookSignature(body, signature, settings.webhookSecret);
      if (!valid) {
        console.warn('[Stylepay Webhook] Assinatura HMAC inválida — rejeitando');
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }
    }

    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    // Mapeamento real Stylepay
    const stylepayId = event.idTransaction;
    const requestNumber = event.requestNumber;
    const eventType = event.event;
    const status = event.statusTransaction;

    console.log('[Stylepay Webhook] Evento:', eventType, '| Status:', status, '| Style ID:', stylepayId, '| Req No:', requestNumber);

    // Identificar Pedido (Prioridade para o ID da Stylepay)
    let orderId = null;

    if (stylepayId) {
      const [foundByStyle] = await db.select().from(orders).where(eq(orders.stylepayPaymentId, stylepayId)).limit(1);
      if (foundByStyle) orderId = foundByStyle.id;
    }

    if (!orderId && requestNumber) {
      // Fallback para requestNumber (ID interno do pedido)
      const [foundByReq] = await db.select().from(orders).where(eq(orders.id, requestNumber)).limit(1);
      if (foundByReq) orderId = foundByReq.id;
    }

    if (!orderId) {
      console.warn('[Stylepay Webhook] Impossível identificar pedido em nossa base:', JSON.stringify(event));
      return NextResponse.json({ received: true, warning: 'Pedido não encontrado' });
    }

    const isPaid = eventType === 'pix.cashin.paid' || status === 'PAID';
    const isCancelled = eventType === 'pix.cashout.cancelled' || status === 'CANCELLED';

    if (isPaid) {
      // Evitar re-processar se já estiver pago
      const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (order && order.status === 'PAID') {
         return NextResponse.json({ received: true, message: 'Já processado' });
      }

      const userId = order?.userId;

      await db.transaction(async (tx) => {
        // 1. Atualizar status do pedido
        await tx.update(orders)
          .set({ status: 'PAID' })
          .where(eq(orders.id, orderId));

        // 2. Buscar itens do pedido para entregar o estoque
        const items = await tx.select().from(require('@/db/schema').orderItems).where(eq(require('@/db/schema').orderItems.orderId, orderId));

        for (const item of items) {
          // Busca itens com slots disponíveis (usedSlots < maxSlots)
          // E que o usuário NUNCA tenha recebido antes (Zero Trust / Anti-duplicidade)
          const availableStock = await tx.select()
            .from(stockItems)
            .where(sql`${stockItems.productId} = ${item.productId} AND ${stockItems.usedSlots} < ${stockItems.maxSlots} AND NOT EXISTS (
              SELECT 1 FROM ${require('@/db/schema').stockDeliveries} 
              WHERE ${require('@/db/schema').stockDeliveries.stockItemId} = ${stockItems.id} 
              AND ${require('@/db/schema').stockDeliveries.userId} = ${userId}
            )`)
            .limit(item.quantity);

          if (availableStock.length > 0) {
            for (const stock of availableStock) {
              // Registrar a entrega
              await tx.insert(require('@/db/schema').stockDeliveries).values({
                id: crypto.randomUUID(),
                stockItemId: stock.id,
                orderId: orderId,
                userId: userId!,
              });

              // Incrementar slots usados
              await tx.update(stockItems)
                .set({ usedSlots: sql`${stockItems.usedSlots} + 1` })
                .where(eq(stockItems.id, stock.id));
            }
          }
        }
      });

      console.log(`[Stylepay Webhook] ✅ Entrega Automática (Multi-Slot) Concluída: Pedido ${orderId}`);
    } else if (isCancelled) {
      await db.update(orders)
        .set({ status: 'CANCELLED' })
        .where(eq(orders.id, orderId));

      console.log(`[Stylepay Webhook] ❌ Pedido ${orderId} cancelado`);
    }

    return NextResponse.json({ received: true, orderId });
  } catch (e: any) {
    console.error('[Stylepay Webhook] Erro crítico:', e.message);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
