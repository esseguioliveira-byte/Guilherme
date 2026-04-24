import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentSettings, orders, stockItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    const eventType: string = event.type ?? event.event ?? event.status ?? '';
    // Stylepay sends external_id as the order ID we set during creation
    const orderId: string | undefined =
      event.external_id ??
      event.data?.external_id ??
      event.metadata?.order_id ??
      event.data?.metadata?.order_id;

    console.log('[Stylepay Webhook] Evento:', eventType, '| Pedido:', orderId ?? 'desconhecido');

    if (!orderId) {
      console.warn('[Stylepay Webhook] external_id ausente no payload:', JSON.stringify(event).slice(0, 300));
      return NextResponse.json({ received: true, warning: 'external_id ausente' });
    }

    const isPaid = ['payment.approved', 'charge.paid', 'PAID', 'paid', 'approved', 'APPROVED'].includes(eventType);
    const isCancelled = ['payment.cancelled', 'charge.cancelled', 'CANCELLED', 'cancelled', 'expired', 'EXPIRED'].includes(eventType);

    if (isPaid) {
      await db.update(orders)
        .set({ status: 'PAID' })
        .where(eq(orders.id, orderId));

      console.log(`[Stylepay Webhook] ✅ Pedido ${orderId} marcado como PAGO`);
    } else if (isCancelled) {
      await db.update(orders)
        .set({ status: 'CANCELLED' })
        .where(eq(orders.id, orderId));

      console.log(`[Stylepay Webhook] ❌ Pedido ${orderId} marcado como CANCELADO`);
    } else {
      console.log(`[Stylepay Webhook] Evento ignorado: ${eventType}`);
    }

    return NextResponse.json({ received: true, event: eventType, orderId });
  } catch (e: any) {
    console.error('[Stylepay Webhook] Erro interno:', e.message);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
