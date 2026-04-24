import { db } from '@/db';
import { users, affiliateTransactions } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { 
  Wallet, 
  TrendingUp, 
  ArrowLeft, 
  Users, 
  History,
  CreditCard,
  Mail,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminAffiliateDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const user = await db.select().from(users).where(eq(users.id, id)).then(res => res[0]);
  
  if (!user) notFound();
  if (!user.isAffiliate) redirect('/admin/affiliates');

  // Stats
  const transactions = await db.select()
    .from(affiliateTransactions)
    .where(eq(affiliateTransactions.affiliateId, user.id))
    .orderBy(desc(affiliateTransactions.createdAt))
    .limit(50);

  const stats = await db.select({
    totalEarned: sql<string>`sum(${affiliateTransactions.amount})`,
    totalSales: sql<number>`count(${affiliateTransactions.id})`
  })
  .from(affiliateTransactions)
  .where(eq(affiliateTransactions.affiliateId, user.id))
  .then(res => res[0]);

  const referredUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    createdAt: users.createdAt,
  })
  .from(users)
  .where(eq(users.referredBy, user.id))
  .orderBy(desc(users.createdAt));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin/affiliates" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar para Lista</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Card */}
        <div className="w-full md:w-80 glass-card p-8 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/40 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <span className="text-4xl font-black text-primary">{user.name?.charAt(0)}</span>
          </div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{user.name}</h2>
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-6">
            <Mail className="w-3 h-3" /> {user.email}
          </div>
          
          <div className="w-full space-y-3">
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Código de Afiliado</p>
                <p className="text-sm font-mono text-primary font-bold">{user.affiliateCode}</p>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Desde</p>
                <p className="text-sm text-white font-bold flex items-center gap-2">
                   <Calendar className="w-3 h-3 text-primary" /> {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </p>
             </div>

             {user.bio && (
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Descrição</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed italic line-clamp-4 hover:line-clamp-none transition-all cursor-default">
                     "{user.bio}"
                  </p>
               </div>
             )}
          </div>

        </div>

        {/* Dashboard Content */}
        <div className="flex-1 space-y-8">
           {/* Stats Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet className="w-12 h-12 text-emerald-400" />
                 </div>
                 <p className="text-[10px] text-gray-500 font-black uppercase mb-2">Saldo Atual</p>
                 <h3 className="text-2xl font-black text-emerald-400 italic">R$ {Number(user.balance).toFixed(2).replace('.', ',')}</h3>
              </div>
              <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp className="w-12 h-12 text-primary" />
                 </div>
                 <p className="text-[10px] text-gray-500 font-black uppercase mb-2">Vendas Totais</p>
                 <h3 className="text-2xl font-black text-white italic">{stats?.totalSales || 0}</h3>
              </div>
              <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Users className="w-12 h-12 text-purple-400" />
                 </div>
                 <p className="text-[10px] text-gray-500 font-black uppercase mb-2">Total Indicações</p>
                 <h3 className="text-2xl font-black text-purple-400 italic">{referredUsers.length}</h3>
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Transactions */}
              <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
                 <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-3">
                       <History className="w-4 h-4 text-primary" /> Histórico de Transações
                    </h3>
                 </div>
                 <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                    {transactions.map((tx) => (
                       <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                          <div>
                             <p className="text-xs font-bold text-white">{tx.description}</p>
                             <p className="text-[9px] text-gray-600 font-mono">{new Date(tx.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <p className={`text-sm font-black italic ${tx.type === 'COMMISSION' ? 'text-emerald-400' : 'text-red-400'}`}>
                             {tx.type === 'COMMISSION' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2).replace('.', ',')}
                          </p>
                       </div>
                    ))}
                    {transactions.length === 0 && (
                       <div className="p-12 text-center text-gray-600 italic text-sm">
                          Nenhuma transação registrada.
                       </div>
                    )}
                 </div>
              </div>

              {/* Referrals */}
              <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
                 <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-3">
                       <Users className="w-4 h-4 text-primary" /> Usuários Indicados
                    </h3>
                 </div>
                 <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                    {referredUsers.map((ref) => (
                       <div key={ref.id} className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                          <div>
                             <p className="text-xs font-bold text-white">{ref.name}</p>
                             <p className="text-[9px] text-gray-600">{ref.email}</p>
                          </div>
                          <p className="text-[9px] text-gray-500 font-mono">{new Date(ref.createdAt).toLocaleDateString('pt-BR')}</p>
                       </div>
                    ))}
                    {referredUsers.length === 0 && (
                       <div className="p-12 text-center text-gray-600 italic text-sm">
                          Nenhum usuário indicado ainda.
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
