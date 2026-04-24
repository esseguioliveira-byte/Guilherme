'use server';

import { z } from 'zod';
import crypto from 'crypto';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

const checkoutSchema = z.object({
  productId: z.string().min(1, 'ID do produto é obrigatório'),
  quantity: z.number().int().min(1, 'A quantidade deve ser pelo menos 1'),
});

export async function processPurchase(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Você precisa estar logado para comprar.' };
    }

    const parsed = checkoutSchema.safeParse({
      productId: formData.get('productId'),
      quantity: Number(formData.get('quantity')),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { productId, quantity } = parsed.data;

    // Buscar preço real no banco
    const productList = await db.select().from(products).where(eq(products.id, productId));
    const product = productList[0];
    
    if (!product) {
      return { success: false, error: 'Produto indisponível.' };
    }

    const price = Number(product.price);
    const totalAmount = price * quantity;
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${crypto.randomUUID()}520400005303986540${totalAmount.toFixed(2).replace('.', '')}5802BR5913Digital Store6008Brasilia62070503***6304`;
    const orderId = crypto.randomUUID();

    // Validar estoque
    if (product.stock < quantity) {
      return { success: false, error: 'Estoque insuficiente para a quantidade solicitada.' };
    }

    // Deduzir estoque
    await db.update(products)
      .set({ stock: product.stock - quantity })
      .where(eq(products.id, productId));

    // Inserir no banco
    await db.insert(orders).values({
      id: orderId,
      userId: session.user.id,
      status: 'PENDING',
      totalAmount: totalAmount.toString(),
      pixCode,
    });

    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId,
      productId,
      quantity,
      price: price.toString(),
    });

    return {
      success: true,
      orderId,
      pixCode,
      message: 'Pedido gerado com sucesso. Aguardando pagamento via PIX.',
    };

  } catch (error) {
    console.error('Erro no processamento da compra:', error);
    return { success: false, error: 'Ocorreu um erro inesperado durante o checkout.' };
  }
}
