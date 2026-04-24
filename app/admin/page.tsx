import { db } from '@/db';
import { orders, orderItems, products, users, siteVisits } from '@/db/schema';
import { eq, sql, desc, and, gte } from 'drizzle-orm';
import { TrendingUp, ShoppingBag, Users, Wallet, ArrowUpRight, ShoppingCart, Eye, Package, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import DashboardCharts from '@/components/admin/DashboardCharts';

export default async function AdminPage({ 
  searchParams 
}: { 
  searchParams: { days?: string } 
}) {
  const { days } = await searchParams;
  const daysRange = parseInt(days || '7');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysRange);

  // Stats (within range)
  const paidOrders = await db.select().from(orders).where(and(eq(orders.status, 'PAID'), gte(orders.createdAt, startDate)));
  
  const totalRevenue = paidOrders.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
  const totalSales = paidOrders.length;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Real Visitor Count (within range)
  const visitorsResult = await db.select({ count: sql<number>`count(*)` })
    .from(siteVisits)
    .where(gte(siteVisits.createdAt, startDate));
  const visitorCount = visitorsResult[0]?.count || 0;


  // Real Conversion Rate
  const conversionRate = visitorCount > 0 ? (totalSales / visitorCount) * 100 : 0;

  // Fetch Recent Sales
  const recentSales = await db.select({
    id: orders.id,
    totalAmount: orders.totalAmount,
    status: orders.status,
    createdAt: orders.createdAt,
    userName: users.name,
    userEmail: users.email
  })
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id))
  .orderBy(desc(orders.createdAt))
  .limit(5);

  // Fetch Popular Products
  const popularProducts = await db.select({
    id: products.id,
    name: products.name,
    imageUrl: products.imageUrl,
    price: products.price,
    salesCount: sql<number>`count(${orderItems.id})`,
    totalRevenue: sql<string>`sum(${orderItems.price} * ${orderItems.quantity})`
  })
  .from(products)
  .leftJoin(orderItems, eq(orderItems.productId, products.id))
  .groupBy(products.id)
  .orderBy(desc(sql`count(${orderItems.id})`))
  .limit(4);

  // Real Chart Data for the selected range
  const dailyStats = await db.select({
    date: sql<string>`DATE_FORMAT(${orders.createdAt}, '%d/%m')`,
    sales: sql<number>`count(*)`,
    revenue: sql<number>`sum(${orders.totalAmount})`
  })
  .from(orders)
  .where(and(eq(orders.status, 'PAID'), gte(orders.createdAt, startDate)))
  .groupBy(sql`DATE(${orders.createdAt})`)
  .orderBy(sql`DATE(${orders.createdAt})`);

  // Fill gaps for chart data
  const chartData = [];
  for (let i = daysRange - 1; i >= 0; i--) {
     const date = new Date();
     date.setDate(date.getDate() - i);
     const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
     
     const stat = dailyStats.find(s => s.date === formattedDate);
     chartData.push({
        date: formattedDate,
        sales: stat?.sales || 0,
        revenue: Number(stat?.revenue || 0)
     });
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-4">
              Visão Geral
              <div className="px-3 py-1 bg-primary/10 rounded-lg border border-primary/20 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] text-primary font-black tracking-widest uppercase">Live Metrics</span>
              </div>
           </h1>
           <p className="text-gray-500 font-medium mt-1">Dados reais consolidados do banco de dados.</p>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Faturamento */}
        <div className="glass-card p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
           <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Faturamento</p>
           </div>
           <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
           <p className="text-[10px] text-gray-500 font-medium italic">Valor real acumulado em vendas pagas</p>
        </div>

        {/* Card: Vendas */}
        <div className="glass-card p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
           <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Vendas</p>
           </div>
           <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1">{totalSales}</h2>
           <p className="text-[10px] text-gray-500 font-medium italic">Volume total de pedidos aprovados</p>
        </div>

        {/* Card: Conversão */}
        <div className="glass-card p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
           <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Taxa de Conversão</p>
           </div>
           <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1">{conversionRate.toFixed(2)}%</h2>
           <p className="text-[10px] text-gray-500 font-medium italic">Vendas / Visitantes reais</p>
        </div>

        {/* Card: Ticket Médio */}
        <div className="glass-card p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
           <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Ticket Médio</p>
           </div>
           <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1">R$ {avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
           <p className="text-[10px] text-gray-500 font-medium italic">Média real por pedido pago</p>
        </div>
      </div>

      {/* Middle Row: Charts */}
      <DashboardCharts salesData={chartData} visitorCount={visitorCount} currentDays={daysRange} />


      {/* Bottom Row: Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Recent Sales List */}
         <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
               <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-primary" /> Últimas Vendas
               </h3>
               <Link href="/admin/orders" className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all flex items-center gap-1 group">
                  Ver mais <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
            <div className="flex-1 divide-y divide-white/5">
               {recentSales.map(sale => (
                  <div key={sale.id} className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                           {sale.userName?.charAt(0) || 'U'}
                        </div>
                        <div>
                           <p className="text-xs font-bold text-white mb-0.5">{sale.userName}</p>
                           <p className="text-[10px] text-gray-600 font-mono">#{sale.id.split('-')[0].toUpperCase()}</p>
                        </div>
                     </div>
                     <p className="text-sm font-black italic text-emerald-400">R$ {Number(sale.totalAmount).toFixed(2).replace('.', ',')}</p>
                  </div>
               ))}
               {recentSales.length === 0 && (
                  <div className="p-12 text-center text-gray-600 italic text-xs">Nenhum pedido recente.</div>
               )}
            </div>
         </div>

         {/* Popular Products */}
         <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
               <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-3">
                  <Package className="w-4 h-4 text-purple-400" /> Produtos Populares
               </h3>
               <Link href="/admin/products" className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all flex items-center gap-1 group">
                  Ver mais <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
            <div className="flex-1 divide-y divide-white/5">
               {popularProducts.map(product => (
                  <div key={product.id} className="p-6 hover:bg-white/[0.02] transition-colors flex items-center gap-4 group">
                     <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5 bg-black flex-shrink-0">
                        {product.imageUrl && <img src={product.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate mb-0.5 uppercase italic">{product.name}</p>
                        <p className="text-[10px] text-gray-600 font-black uppercase">{product.salesCount} Vendas</p>
                     </div>
                     <p className="text-sm font-black italic text-white">R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Popular Coupons (Mocked for UI) */}
         <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
               <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-3">
                  <Tag className="w-4 h-4 text-amber-400" /> Cupons Populares
               </h3>
               <Link href="#" className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all flex items-center gap-1 group">
                  Ver mais <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
            <div className="flex-1 divide-y divide-white/5">
               <div className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-[10px] font-black text-amber-400 border border-amber-400/20">
                        %
                     </div>
                     <div>
                        <p className="text-xs font-black text-white mb-0.5">LAUNCH20</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase">240 Usos</p>
                     </div>
                  </div>
                  <p className="text-sm font-black italic text-amber-400">R$ 2.450,00</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
