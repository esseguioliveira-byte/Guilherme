import { db } from '@/db';
import { orders, orderItems, products, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Package, User, CreditCard, Calendar, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';

export default async function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const order = await db.select({
    id: orders.id,
    totalAmount: orders.totalAmount,
    status: orders.status,
    createdAt: orders.createdAt,
    customerName: users.name,
    customerEmail: users.email,
    userId: orders.userId
  })
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id))
  .where(eq(orders.id, id))
  .then(res => res[0]);

  if (!order) notFound();

  const items = await db.select({
    id: orderItems.id,
    quantity: orderItems.quantity,
    price: orderItems.price,
    productName: products.name,
    productImage: products.imageUrl,
  })
  .from(orderItems)
  .leftJoin(products, eq(orderItems.productId, products.id))
  .where(eq(orderItems.orderId, id));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/admin/orders" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar para Pedidos</span>
        </Link>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status as any} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-3">
                <Package className="w-4 h-4 text-primary" /> Itens do Pedido
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={item.productImage || undefined} alt={item.productName || 'Produto'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{item.productName}</h4>
                    <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white italic">R$ {(Number(item.price) * item.quantity).toFixed(2)}</p>
                    <p className="text-[10px] text-gray-500">R$ {Number(item.price).toFixed(2)} un.</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
              <span className="text-xs font-black uppercase text-gray-500">Total do Pedido</span>
              <span className="text-2xl font-black text-primary italic">R$ {Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-6 rounded-[2rem] border border-white/5">
            <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-3 mb-6">
              <User className="w-4 h-4 text-primary" /> Cliente
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                <span className="text-primary font-bold">{order.customerName?.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{order.customerName}</p>
                <p className="text-[10px] text-gray-500">{order.customerEmail}</p>
              </div>
            </div>
            <Link 
              href={`/admin/customers/${order.userId}`}
              className="block w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all"
            >
              Ver Perfil Completo
            </Link>
          </div>

          <div className="glass-card p-6 rounded-[2rem] border border-white/5">
            <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-3 mb-6">
              <CreditCard className="w-4 h-4 text-primary" /> Detalhes
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-gray-500">Pedido ID</span>
                <span className="text-[10px] font-mono text-white">#{order.id.slice(0, 12)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-gray-500">Data</span>
                <span className="text-[10px] font-bold text-white">{new Date(order.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-gray-500">Método</span>
                <span className="text-[10px] font-bold text-emerald-400">PIX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
