'use server';

import { db } from '@/db';
import { products, stockItems } from '@/db/schema';
import { eq, sql, isNull } from 'drizzle-orm';

/**
 * Sincroniza a coluna 'stock' da tabela 'products' com a quantidade real
 * de itens disponíveis na tabela 'stock_items' (onde orderId é nulo).
 */
export async function synchronizeProductStock(productId: string, tx?: any) {
  const connection = tx || db;
  
  const [countResult] = await connection
    .select({ count: sql<number>`COALESCE(SUM(${stockItems.maxSlots} - ${stockItems.usedSlots}), 0)` })
    .from(stockItems)
    .where(eq(stockItems.productId, productId));

  const actualStock = Number(countResult?.count || 0);

  await connection
    .update(products)
    .set({ stock: actualStock })
    .where(eq(products.id, productId));
    
  return actualStock;
}

/**
 * Sincroniza a coluna 'stock' da tabela 'products' com a quantidade real
 * de itens disponíveis na tabela 'stock_items'.
 */
export async function synchronizeGlobalStock() {
  console.log('[Stock Sync] Iniciando sincronização global...');
  
  try {
    const allProducts = await db.select({ id: products.id }).from(products);
    
    let totalUpdated = 0;

    for (const product of allProducts) {
      await synchronizeProductStock(product.id);
      totalUpdated++;
    }

    console.log(`[Stock Sync] Sucesso! ${totalUpdated} produtos sincronizados.`);
    return { success: true, message: `${totalUpdated} produtos sincronizados.` };
  } catch (error) {
    console.error('[Stock Sync] Erro fatal:', error);
    return { success: false, error: 'Falha na sincronização.' };
  }
}
