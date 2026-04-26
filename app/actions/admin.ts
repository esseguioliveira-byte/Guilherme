'use server';

import { db } from '@/db';
import { products, users, orders, orderItems, stockItems, stockDeliveries } from '@/db/schema';

import { eq, and, sql } from 'drizzle-orm';
import { synchronizeProductStock } from './stock-sync';
import { auth } from '@/auth';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

// Middleware para verificar permissão
async function checkAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('Não autorizado');
}

export async function updateOrderStatus(orderId: string, status: 'PENDING' | 'PAID' | 'CANCELLED') {
  try {
    await checkAdmin();
    
    const [oldOrder] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!oldOrder) throw new Error('Pedido não encontrado');

    await db.update(orders).set({
      status,
    }).where(eq(orders.id, orderId));

    // Lógica de Entrega Automática
    if (status === 'PAID' && oldOrder?.status !== 'PAID') {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      const userId = oldOrder.userId;
      
      for (const item of items) {
        const availableStock = await db.select()
          .from(stockItems)
          .where(sql`${stockItems.productId} = ${item.productId} AND ${stockItems.usedSlots} < ${stockItems.maxSlots} AND NOT EXISTS (
            SELECT 1 FROM ${stockDeliveries} 
            WHERE ${stockDeliveries.stockItemId} = ${stockItems.id} 
            AND ${stockDeliveries.userId} = ${userId}
          )`)
          .limit(item.quantity);

        for (const stock of availableStock) {
          // Registrar entrega
          await db.insert(stockDeliveries).values({
            id: crypto.randomUUID(),
            stockItemId: stock.id,
            orderId: orderId,
            userId: userId,
          });

          // Incrementar slots
          await db.update(stockItems)
            .set({ usedSlots: sql`${stockItems.usedSlots} + 1` })
            .where(eq(stockItems.id, stock.id));
        }
        
        await synchronizeProductStock(item.productId);
      }
    }

    revalidatePath('/admin/orders');
    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao atualizar status do pedido' };
  }
}



export async function updateAffiliateCommission(userId: string, rate: string) {
  try {
    await checkAdmin();
    
    await db.update(users).set({
      commissionRate: rate,
    }).where(eq(users.id, userId));

    revalidatePath('/admin/affiliates');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao atualizar comissão' };
  }
}


export async function createProduct(formData: FormData) {
  try {
    await checkAdmin();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const categoryId = formData.get('categoryId') as string;
    const categoryName = formData.get('categoryName') as string; // Keep for legacy
    const parentId = formData.get('parentId') as string;
    const stock = Number(formData.get('stock'));
    const imageUrl = formData.get('imageUrl') as string;

    await db.insert(products).values({
      id: crypto.randomUUID(),
      name,
      description,
      price,
      category: categoryName || 'Outros', // Legacy field
      categoryId: categoryId || null,
      parentId: parentId || null,
      stock,
      imageUrl,
    });

    revalidatePath('/admin/products');
    revalidatePath('/'); // Vitrine
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao criar produto' };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    await checkAdmin();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const categoryId = formData.get('categoryId') as string;
    const categoryName = formData.get('categoryName') as string;
    const parentId = formData.get('parentId') as string;
    const stock = Number(formData.get('stock'));
    const imageUrl = formData.get('imageUrl') as string;

    await db.update(products).set({
      name,
      description,
      price,
      category: categoryName,
      categoryId: categoryId || null,
      parentId: parentId || null,
      stock,
      imageUrl,
    }).where(eq(products.id, id));



    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao atualizar produto' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await checkAdmin();
    await db.delete(products).where(eq(products.id, id));
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao deletar produto' };
  }
}

export async function addStockItems(productId: string, content: string, maxSlots: number = 1) {
  try {
    await checkAdmin();
    const items = content.split('\n').filter(line => line.trim() !== '');
    for (const item of items) {
      await db.insert(stockItems).values({
        id: crypto.randomUUID(),
        productId,
        content: item.trim(),
        maxSlots,
        usedSlots: 0
      });
    }
    
    await synchronizeProductStock(productId);
    
    revalidatePath('/admin/stock');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStockItem(id: string) {
  try {
    await checkAdmin();
    const [item] = await db.select().from(stockItems).where(eq(stockItems.id, id));
    await db.delete(stockItems).where(eq(stockItems.id, id));
    
    if (item) {
      await synchronizeProductStock(item.productId);
    }
    
    revalidatePath('/admin/stock');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

