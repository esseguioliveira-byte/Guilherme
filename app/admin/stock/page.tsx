import { db } from '@/db';
import { stockItems, products } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { Package, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import BulkStockAdd from '@/components/admin/BulkStockAdd';
import { deleteStockItem } from '@/app/actions/admin';

export default async function AdminStockPage() {
  const allStock = await db.select({
    id: stockItems.id,
    content: stockItems.content,
    isSold: stockItems.isSold,
    createdAt: stockItems.createdAt,
    productName: products.name,
    productId: products.id,
  })
  .from(stockItems)
  .leftJoin(products, eq(stockItems.productId, products.id))
  .orderBy(desc(stockItems.createdAt));

  const allProducts = await db.select().from(products);

  const stockSummary = await db.select({
    productId: stockItems.productId,
    count: sql<number>`count(*)`,
    available: sql<number>`sum(case when ${stockItems.isSold} = false then 1 else 0 end)`
  })
  .from(stockItems)
  .groupBy(stockItems.productId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" /> Gerenciar Estoque
          </h1>
          <p className="text-gray-500">Adicione e monitore itens para entrega automática de produtos digitais.</p>
        </div>
        <BulkStockAdd products={allProducts} />
      </div>

      {/* Stock Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {allProducts.map(p => {
            const summary = stockSummary.find(s => s.productId === p.id);
            const available = summary?.available || 0;
            return (
               <div key={p.id} className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div>
                     <p className="text-[10px] text-gray-500 font-black uppercase mb-1">{p.name}</p>
                     <h3 className={`text-xl font-black italic ${available > 0 ? 'text-white' : 'text-red-400'}`}>
                        {available} Disponíveis
                     </h3>
                  </div>
                  {available === 0 && (
                     <p className="text-[9px] text-red-400 mt-2 flex items-center gap-1 font-bold uppercase">
                        <AlertCircle className="w-3 h-3" /> Sem Estoque
                     </p>
                  )}
               </div>
            );
         })}
      </div>

      <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-gray-500">
                <th className="px-8 py-5 font-black">Produto</th>
                <th className="px-8 py-5 font-black">Conteúdo</th>
                <th className="px-8 py-5 font-black">Status</th>
                <th className="px-8 py-5 font-black">Data</th>
                <th className="px-8 py-5 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allStock.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-white">{item.productName}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-mono text-gray-400 bg-black/40 px-3 py-1 rounded-lg border border-white/5 inline-block max-w-[200px] truncate">
                      {item.content}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    {item.isSold ? (
                      <span className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase">
                        <CheckCircle className="w-3 h-3" /> Vendido
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase">
                        <Clock className="w-3 h-3" /> Em Estoque
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[10px] text-gray-500">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <form action={async () => {
                      'use server';
                      await deleteStockItem(item.id);
                    }}>
                      <button className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {allStock.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-600 italic">
                    Nenhum item em estoque no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
