import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { orders, orderItems, products, stockItems, users } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import DeliveryItem from '@/components/profile/DeliveryItem';
import { Package, ArrowRight, Terminal, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).then(res => res[0]);
  const rawOrders = await db.select().from(orders).where(eq(orders.userId, session.user.id)).orderBy(desc(orders.createdAt));
  
  const orderIds = rawOrders.map(o => o.id);
  let allItems: any[] = [];
  let deliveredItems: any[] = [];
  
  if (orderIds.length > 0) {
    allItems = await db
      .select({
        item: orderItems,
        product: products,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds));

    deliveredItems = await db
      .select()
      .from(stockItems)
      .where(inArray(stockItems.orderId, orderIds));
  }

  const userOrdersList = rawOrders.map(order => ({
    ...order,
    items: allItems
      .filter(i => i.item.orderId === order.id)
      .map(i => ({
        ...i.item,
        product: i.product,
        delivered: deliveredItems.filter(d => d.productId === i.item.productId && d.orderId === order.id)
      }))
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black uppercase italic tracking-widest text-white flex items-center gap-3 mb-8">
        <Package className="w-6 h-6 text-primary" />
        Seus Pedidos
      </h2>

      {userOrdersList.length === 0 ? (
        <div className="glass-card rounded-[2.5rem] p-16 text-center border-dashed border-white/10">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Package className="w-10 h-10 text-gray-700" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Vazio como o espaço...</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Você ainda não realizou nenhuma compra. Explore nossos produtos estelares!</p>
          <Link href="/" className="btn-stardust px-10 py-4 text-white rounded-2xl font-black italic uppercase transition-all">
            Ver Produtos
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {userOrdersList.map((order) => (
            <div key={order.id} className="glass-card rounded-[2rem] p-5 sm:p-8 border border-white/5 hover:border-white/10 transition-all">
              
              {/* HEADER MOBILE (Até 768px) - Garantindo visibilidade total */}
              <div className="sm:hidden flex flex-col gap-3 mb-6 pb-6 border-b border-white/5">
                {/* Linha 1: ID e Status lado a lado */}
                <div className="flex justify-between items-center w-full">
                  <div>
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">ID DO PEDIDO</p>
                    <p className="text-sm font-mono text-primary font-bold">#{order.id.split('-')[0].toUpperCase()}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm
                    ${order.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 
                      order.status === 'PENDING' ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40' : 
                      'bg-red-500/20 text-red-400 border-red-500/40'}`}
                    style={{ display: 'inline-block !important' }}
                  >
                    {order.status === 'PAID' ? 'PAGO' : order.status === 'PENDING' ? 'PENDENTE' : 'CANCELADO'}
                  </div>
                </div>

                {/* Linha 2: Data e Total lado a lado */}
                <div className="flex justify-between items-center w-full pt-2 opacity-90">
                  <div>
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">DATA</p>
                    <p className="text-[14px] font-bold text-gray-200">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '---'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">TOTAL</p>
                    <p className="text-[16px] font-black text-white" style={{ display: 'block !important' }}>
                      R$ {Number(order.totalAmount).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              </div>

              {/* HEADER DESKTOP (Acima de 768px) */}
              <div className="hidden sm:grid grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/5">
                <div>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">ID DO PEDIDO</p>
                  <p className="text-sm font-mono text-primary font-bold">#{order.id.split('-')[0].toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">STATUS</p>
                  <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                    ${order.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'}`}
                  >
                    {order.status === 'PAID' ? 'Aprovado' : order.status === 'PENDING' ? 'Pendente' : 'Cancelado'}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">DATA</p>
                  <p className="text-sm font-bold text-gray-300">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '---'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">TOTAL</p>
                  <p className="text-lg font-black text-white italic leading-tight">R$ {Number(order.totalAmount).toFixed(2).replace('.', ',')}</p>
                </div>
              </div>

              {/* LISTA DE PRODUTOS */}
              <div className="space-y-4">
                <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em] mb-2 sm:hidden">ITENS DO PEDIDO</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 sm:gap-5 p-3 sm:p-4 bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl group hover:bg-white/[0.04] transition-all">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#050505] rounded-lg sm:rounded-xl flex-shrink-0 overflow-hidden border border-white/5">
                       {item.product?.imageUrl && <img src={item.product.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold nasa-title text-[11px] sm:text-sm leading-tight mb-1">{item.product?.name || 'Produto'}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Qtd: {item.quantity} × R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
                      
                      {/* Entrega Automática */}
                      {order.status === 'PAID' && item.delivered && item.delivered.length > 0 && (
                        <div className="mt-3 sm:mt-4 space-y-2">
                           <p className="text-[8px] sm:text-[9px] font-black uppercase text-primary flex items-center gap-2">
                              <Terminal className="w-3 h-3" /> Sua Entrega:
                           </p>
                           <div className="space-y-2">
                              {item.delivered.map((d: any) => (
                                 <DeliveryItem key={d.id} content={d.content} />
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                    {order.status === 'PENDING' && (
                      <Link href={`/orders/${order.id}`} className="p-2.5 sm:p-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg sm:rounded-xl transition-all border border-primary/20">
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    {/* Botão Afiliado no Mobile */}
    <div className="md:hidden mt-8">
       <Link 
          href={user?.isAffiliate ? "/profile/affiliate" : "/affiliates"} 
          className={`flex items-center justify-between p-6 rounded-3xl group active:scale-95 transition-all border ${
            user?.isAffiliate 
              ? "bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20" 
              : "bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 border-emerald-500/20"
          }`}
       >
          <div>
             <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${user?.isAffiliate ? "text-primary" : "text-emerald-400"}`}>
               {user?.isAffiliate ? "Gestão" : "Oportunidade"}
             </p>
             <h3 className="text-lg font-black text-white uppercase italic">
               {user?.isAffiliate ? "Painel Afiliado" : "Seja um Afiliado"}
             </h3>
             <p className="text-xs text-gray-500 font-medium">
               {user?.isAffiliate ? "Gerencie suas vendas e lucros" : "Ganhe comissões indicando nossa loja!"}
             </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
            user?.isAffiliate ? "bg-primary/20 border-primary/30" : "bg-emerald-500/20 border-emerald-500/30"
          }`}>
             {user?.isAffiliate ? <TrendingUp className="w-6 h-6 text-primary" /> : <DollarSign className="w-6 h-6 text-emerald-400" />}
          </div>
       </Link>
    </div>
  </div>
  );
}
