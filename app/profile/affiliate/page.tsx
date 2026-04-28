import { auth } from '@/auth';
import { db } from '@/db';
import { users, affiliateTransactions } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  Copy, 
  History,
  CreditCard,
  ShieldAlert,
  Users
} from 'lucide-react';
import Link from 'next/link';
import WithdrawalMinimalButton from '@/components/WithdrawalMinimalButton';
import CopyButton from '@/components/CopyButton';

export default async function AffiliateTab() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).then(res => res[0]);
  
  if (!user) redirect('/login');

  // If not affiliate, show join section
  if (!user.isAffiliate) {
    return (
      <div className="glass-card rounded-[2.5rem] p-16 text-center border-dashed border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
        
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
           <TrendingUp className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">Torne-se um Parceiro</h2>
        <p className="text-gray-500 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
           Ganhe comissões vitalícias de até <span className="text-white font-bold italic">20%</span> sobre cada venda realizada através do seu link exclusivo.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
           {[
             { title: 'Zero Investimento', desc: 'Comece hoje mesmo sem gastar nada.' },
             { title: 'RevShare Real', desc: 'Ganhe em todas as recompras dos indicados.' },
             { title: 'Pagamento Rápido', desc: 'Saques descomplicados via PIX.' }
           ].map((item, i) => (
             <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-sm font-black text-white uppercase italic mb-1">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
             </div>
           ))}
        </div>

        <Link href="/affiliates" className="btn-stardust px-12 py-5 text-white rounded-2xl font-black text-xl italic uppercase transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)]">
           Quero me Inscrever
        </Link>
      </div>
    );
  }

  // Dashboard Data
  const transactions = await db.select()
    .from(affiliateTransactions)
    .where(eq(affiliateTransactions.affiliateId, user.id))
    .orderBy(desc(affiliateTransactions.createdAt))
    .limit(5);

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
  .orderBy(desc(users.createdAt))
  .limit(10);

  const totalReferrals = referredUsers.length;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const affiliateLink = `${baseUrl}/?ref=${user.affiliateCode}`;



  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      
      {/* Hero-style Header (Same as Home) */}
      <section className="w-full py-12 flex flex-col items-center justify-center text-center relative overflow-hidden mb-12">
        {/* Glow Effect (Home Style) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            Parceria Ativa
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 nasa-title uppercase italic">
            Seu Império de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Afiliado</span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Olá, <span className="text-white font-bold">{user.name}</span>! Gerencie suas indicações, acompanhe seus lucros e escale seus ganhos com nossa infraestrutura de ponta.
          </p>

          <div className="flex items-center gap-4">
             <div className="px-6 py-2 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest">
                ID: {user.id.slice(0, 8)}
             </div>
             <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Cod: {user.affiliateCode}
             </div>
          </div>
        </div>
      </section>


      {/* Stats Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-8 rounded-[2rem] border border-white/5 group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-16 h-16 text-emerald-400" />
           </div>
           <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Saldo Disponível</p>
           <h3 className="text-2xl font-black text-emerald-400 italic">R$ {Number(user.balance).toFixed(2).replace('.', ',')}</h3>
           <WithdrawalMinimalButton balance={Number(user.balance)} />
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-white/5 group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16 text-primary" />
           </div>
           <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Vendas</p>
           <h3 className="text-2xl font-black text-white italic">{stats?.totalSales || 0}</h3>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-white/5 group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <Users className="w-16 h-16 text-purple-400" />
           </div>
           <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Indicações</p>
           <h3 className="text-2xl font-black text-purple-400 italic">{totalReferrals}</h3>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border border-emerald-500/10 group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <ArrowUpRight className="w-16 h-16 text-white" />
           </div>
           <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-2">Comissão</p>
           <h3 className="text-2xl font-black text-emerald-400 italic">{Number(user.commissionRate)}%</h3>
        </div>
      </div>

      {/* Referral Link */}
      <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
         <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
               <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-4 flex items-center gap-3">
                  <Copy className="w-5 h-5 text-primary" /> Seu Link Exclusivo
               </h3>
               <div className="bg-[#050505] border border-white/5 rounded-2xl p-4 font-mono text-xs text-gray-500 truncate mb-4">
                  {affiliateLink}
               </div>
               <CopyButton text={affiliateLink} />
            </div>
            <div className="hidden md:block w-48 h-48 bg-primary/5 rounded-[2rem] border border-white/5 p-6 text-center">
               <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldAlert className="w-6 h-6 text-primary" />
               </div>
               <p className="text-[10px] font-black text-white uppercase italic mb-1">Zero Trust</p>
               <p className="text-[9px] text-gray-600 leading-tight">Link protegido contra fraudes e rastreio 100% verificado.</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
           <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                 <History className="w-5 h-5 text-primary" /> Atividade
              </h3>
           </div>
           <div className="divide-y divide-white/5">
              {transactions.map((tx) => (
                 <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center gap-4">
                       <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                          tx.type === 'COMMISSION' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
                       }`}>
                          {tx.type === 'COMMISSION' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <CreditCard className="w-4 h-4 text-red-400" />}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-white">{tx.description}</p>
                          <p className="text-[9px] text-gray-600 font-mono uppercase">{new Date(tx.createdAt).toLocaleDateString('pt-BR')}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-sm font-black italic ${tx.type === 'COMMISSION' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.type === 'COMMISSION' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2).replace('.', ',')}
                       </p>
                    </div>
                 </div>
              ))}
              {transactions.length === 0 && (
                 <div className="p-10 text-center text-gray-600 italic text-sm">
                    Nenhuma transação.
                 </div>
              )}
           </div>
        </div>

        {/* Indicações */}
        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
           <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                 <Users className="w-5 h-5 text-primary" /> Suas Indicações
              </h3>
           </div>
           <div className="divide-y divide-white/5">
              {referredUsers.map((ref) => (
                 <div key={ref.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-400" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-white">{ref.name}</p>
                          <p className="text-[9px] text-gray-600">{ref.email.replace(/(.{3}).+(@.+)/, "$1***$2")}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-emerald-400 uppercase italic">Ativo</p>
                       <p className="text-[8px] text-gray-600 font-mono">{new Date(ref.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                 </div>
              ))}
              {referredUsers.length === 0 && (
                 <div className="p-10 text-center text-gray-600 italic text-sm">
                    Nenhuma indicação ainda.
                 </div>
              )}
           </div>
        </div>
      </div>


    </div>
  );
}
