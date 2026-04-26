'use server';

import { db } from '@/db';
import { products, stockItems } from '@/db/schema';
import { eq, sql, isNull } from 'drizzle-orm';

/**
 * Sincroniza a coluna 'stock' da tabela 'products' com a quantidade real
 * de itens disponíveis na tabela 'stock_items' (onde orderId é nulo).
 */
export async function synchronizeGlobalStock() {
  console.log('[Stock Sync] Iniciando sincronização global...');
  
  try {
    const allProducts = await db.select({ id: products.id }).from(products);
    
    let totalUpdated = 0;

    for (const product of allProducts) {
      // Contar quantos itens reais existem para este produto que NÃO foram vendidos
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(stockItems)
        .where(sql`${stockItems.productId} = ${product.id} AND ${stockItems.orderId} IS NULL`);

      const actualStock = Number(countResult?.count || 0);

      // Atualizar a tabela de produtos com o valor real
      await db
        .update(products)
        .set({ stock: actualStock })
        .where(eq(products.id, product.id));
      
      totalUpdated++;
    }

    console.log(`[Stock Sync] Sucesso! ${totalUpdated} produtos sincronizados.`);
    return { success: true, message: `${totalUpdated} produtos sincronizados.` };
  } catch (error) {
    console.error('[Stock Sync] Erro fatal:', error);
    return { success: false, error: 'Falha na sincronização.' };
  }
}
