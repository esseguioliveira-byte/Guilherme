import { auth } from '@/auth';
import { db } from '@/db';
import { users, affiliateTransactions } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { 
  Wallet, 
  Users as UsersIcon, 
  TrendingUp, 
  ArrowUpRight, 
  Copy, 
  History,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import Navbar from '@/components/Navbar';
import WithdrawalButton from '@/components/WithdrawalButton';
import { withdrawalRequests } from '@/db/schema';

export default async function AffiliateDashboard() {

  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).then(res => res[0]);
  
  if (!user || !user.isAffiliate) {
    redirect('/affiliates');
  }

  const transactions = await db.select()
    .from(affiliateTransactions)
    .where(eq(affiliateTransactions.affiliateId, user.id))
    .orderBy(desc(affiliateTransactions.createdAt))
    .limit(10);

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
  .limit(20);

  const totalReferrals = referredUsers.length; // Ideally this should be a count query if there are many

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const affiliateLink = `${baseUrl}/?ref=${user.affiliateCode}`;

  const myWithdrawals = await db.select()
    .from(withdrawalRequests)
    .where(eq(withdrawalRequests.affiliateId, user.id))
    .orderBy(desc(withdrawalRequests.createdAt))
    .limit(10);


  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 pt-32">
        
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
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 nasa-title uppercase italic text-center">
              Seu Império de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Afiliado</span>
            </h1>
            
            <p className="text-base md:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Olá, <span className="text-white font-bold">{user.name}</span>! Gerencie suas indicações, acompanhe seus lucros e escale seus ganhos com nossa infraestrutura de ponta.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
               <div className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-primary" />
                  <div>
                     <p className="text-[10px] text-primary font-bold uppercase">Saldo Disponível</p>
                     <p className="text-xl font-black italic text-white">R$ {Number(user.balance).toFixed(2).replace('.', ',')}</p>
                  </div>
               </div>
               <WithdrawalButton balance={parseFloat(user.balance as string)} />
            </div>
          </div>
        </section>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-8 bg-[#0A0A0A] border border-[#222] rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
               <TrendingUp className="w-12 h-12 text-emerald-400" />
            </div>
            <p className="text-sm text-gray-500 font-bold uppercase mb-2">Total Ganhos</p>
            <h3 className="text-3xl font-black italic text-emerald-400">R$ {Number(stats?.totalEarned || 0).toFixed(2).replace('.', ',')}</h3>
          </div>
          <div className="p-8 bg-[#0A0A0A] border border-[#222] rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
               <ArrowUpRight className="w-12 h-12 text-blue-400" />
            </div>
            <p className="text-sm text-gray-500 font-bold uppercase mb-2">Vendas</p>
            <h3 className="text-3xl font-black italic text-blue-400">{stats?.totalSales || 0}</h3>
          </div>
          <div className="p-8 bg-[#0A0A0A] border border-[#222] rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
               <UsersIcon className="w-12 h-12 text-purple-400" />
            </div>
            <p className="text-sm text-gray-500 font-bold uppercase mb-2">Indicações</p>
            <h3 className="text-3xl font-black italic text-purple-400">{totalReferrals}</h3>
          </div>
          <div className="p-8 bg-primary/5 border border-primary/20 rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
               <Wallet className="w-12 h-12 text-primary" />
            </div>
            <p className="text-sm text-primary font-bold uppercase mb-2">Sua Comissão</p>
            <h3 className="text-3xl font-black italic text-white">{Number(user.commissionRate)}%</h3>
          </div>
        </div>

        {/* Link & referral */}
        <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] p-8 mb-12">
           <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Copy className="w-5 h-5 text-primary" /> Seu Link de Indicação
           </h3>
           <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-[#050505] border border-[#111] rounded-2xl p-4 font-mono text-sm text-gray-400 truncate flex items-center">
                 {affiliateLink}
              </div>
              <CopyButton text={affiliateLink} />
           </div>
           <p className="text-xs text-gray-600 mt-4 italic">Compartilhe este link para ganhar comissões automáticas em cada compra.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Transactions */}
          <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] overflow-hidden">
             <div className="p-8 border-b border-[#222] flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-3">
                   <History className="w-5 h-5 text-primary" /> Movimentações
                </h3>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-[#111]/50 text-[10px] uppercase tracking-widest text-gray-500">
                     <th className="px-6 py-4 font-black">Data</th>
                     <th className="px-6 py-4 font-black">Descrição</th>
                     <th className="px-6 py-4 font-black text-right">Valor</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#222]">
                   {transactions.map((tx) => (
                     <tr key={tx.id} className="hover:bg-[#111]/30 transition-all group">
                       <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                       </td>
                       <td className="px-6 py-4">
                          <p className="text-xs font-bold text-white">{tx.description}</p>
                       </td>
                       <td className={`px-6 py-4 text-right font-black italic text-sm ${
                         tx.type === 'COMMISSION' ? 'text-emerald-400' : 'text-red-400'
                       }`}>
                          {tx.type === 'COMMISSION' ? '+' : '-'} R$ {Number(tx.amount).toFixed(2).replace('.', ',')}
                       </td>
                     </tr>
                   ))}
                   {transactions.length === 0 && (
                     <tr>
                       <td colSpan={3} className="px-6 py-10 text-center text-gray-600 italic text-sm">
                          Nenhuma movimentação.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>

          {/* Referred Users */}
          <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] overflow-hidden">
             <div className="p-8 border-b border-[#222] flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-3">
                   <UsersIcon className="w-5 h-5 text-primary" /> Indicações Recentes
                </h3>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-[#111]/50 text-[10px] uppercase tracking-widest text-gray-500">
                     <th className="px-6 py-4 font-black">Usuário</th>
                     <th className="px-6 py-4 font-black">Data de Cadastro</th>
                     <th className="px-6 py-4 font-black text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#222]">
                   {referredUsers.map((ref) => (
                     <tr key={ref.id} className="hover:bg-[#111]/30 transition-all group">
                       <td className="px-6 py-4">
                          <p className="text-xs font-bold text-white">{ref.name}</p>
                          <p className="text-[10px] text-gray-600">{ref.email.replace(/(.{3}).+(@.+)/, "$1***$2")}</p>
                       </td>
                       <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(ref.createdAt).toLocaleDateString('pt-BR')}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase">Ativo</span>
                       </td>
                     </tr>
                   ))}
                   {referredUsers.length === 0 && (
                     <tr>
                       <td colSpan={3} className="px-6 py-10 text-center text-gray-600 italic text-sm">
                          Nenhuma indicação ainda.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] overflow-hidden mb-8">
          <div className="p-8 border-b border-[#222] flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Wallet className="w-5 h-5 text-primary" /> Histórico de Saques
            </h3>
            <WithdrawalButton balance={parseFloat(user.balance as string)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111]/50 text-[10px] uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-4 font-black">Data</th>
                  <th className="px-6 py-4 font-black">Valor</th>
                  <th className="px-6 py-4 font-black">Chave PIX</th>
                  <th className="px-6 py-4 font-black">Tipo</th>
                  <th className="px-6 py-4 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {myWithdrawals.map((w) => {
                  const statusStyles: Record<string, string> = {
                    PENDING:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                    APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
                  };
                  const statusLabels: Record<string, string> = {
                    PENDING: 'Pendente', APPROVED: 'Aprovado', REJECTED: 'Rejeitado',
                  };
                  return (
                    <tr key={w.id} className="hover:bg-[#111]/30 transition-all">
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(w.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-sm font-black italic text-white">R$ {Number(w.amount).toFixed(2).replace('.', ',')}</td>
                      <td className="px-6 py-4 text-xs text-gray-400 font-mono">{w.pixKey}</td>
                      <td className="px-6 py-4 text-[10px] text-gray-600 font-black uppercase">{w.pixKeyType}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${statusStyles[w.status]}`}>
                            {statusLabels[w.status]}
                          </span>
                          {w.adminNote && w.status === 'REJECTED' && (
                            <p className="text-[9px] text-red-400 max-w-[180px] text-right italic">{w.adminNote}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {myWithdrawals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-600 italic text-sm">
                      Nenhum saque solicitado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

  );
}

