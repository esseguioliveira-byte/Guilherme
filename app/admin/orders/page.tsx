import { db } from '@/db';
import { orders, users } from '@/db/schema';
import { eq, desc, or, like } from 'drizzle-orm';
import { ShoppingBag, Search, Eye, MoreHorizontal, CheckCircle2, Clock, XCircle } from 'lucide-react';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import Link from 'next/link';
import SearchInput from '@/components/admin/SearchInput';

const statusConfig = {
  PENDING: { label: 'Pendente', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  PAID: { label: 'Pago', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' }
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q;

  const allOrders = await db.select({
    id: orders.id,
    totalAmount: orders.totalAmount,
    status: orders.status,
    createdAt: orders.createdAt,
    customerName: users.name,
    customerEmail: users.email,
  })
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id))
  .where(
    query ? or(
      like(orders.id, `%${query}%`),
      like(users.name, `%${query}%`),
      like(users.email, `%${query}%`)
    ) : undefined
  )
  .orderBy(desc(orders.createdAt));


  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" /> Gerenciar Pedidos
          </h1>
          <p className="text-gray-500">Acompanhe e gerencie todas as vendas da plataforma.</p>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-4 items-center justify-between">
          <SearchInput placeholder="Buscar por ID, cliente ou e-mail..." />

          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
             {Object.entries(statusConfig).map(([key, config]) => (
                <button key={key} className={`px-4 py-2 rounded-xl border ${config.border} ${config.bg} ${config.color} text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all whitespace-nowrap`}>
                   {config.label}
                </button>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-gray-500">
                <th className="px-8 py-5 font-black">Pedido</th>
                <th className="px-8 py-5 font-black">Cliente</th>
                <th className="px-8 py-5 font-black">Data</th>
                <th className="px-8 py-5 font-black">Total</th>
                <th className="px-8 py-5 font-black">Status</th>
                <th className="px-8 py-5 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allOrders.map((order) => {
                return (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-xs font-mono text-gray-500 truncate w-24">#{order.id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-bold text-white">{order.customerName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-white italic">R$ {Number(order.totalAmount).toFixed(2)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <OrderStatusSelect 
                        orderId={order.id} 
                        currentStatus={order.status as any} 
                      />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {allOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-600 italic">
                    Nenhum pedido encontrado.
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

