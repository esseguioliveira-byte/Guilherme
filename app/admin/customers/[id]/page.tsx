import { db } from '@/db';
import { users, affiliateTransactions, orders } from '@/db/schema';
import { eq, sql, desc, and } from 'drizzle-orm';

import { redirect } from 'next/navigation';
import { User, Shield, DollarSign, ArrowLeft, Save, TrendingUp, Users as UsersIcon, History } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function AdminEditUserPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const user = await db.select().from(users).where(eq(users.id, id)).then(res => res[0]);

  if (!user) redirect('/admin/customers');

  const referralsCount = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.referredBy, id))
    .then(res => res[0].count);

  const referredUsersList = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    createdAt: users.createdAt,
    totalProfit: sql<string>`COALESCE(SUM(${affiliateTransactions.amount}), 0)`
  })
  .from(users)
  .leftJoin(orders, eq(orders.userId, users.id))
  .leftJoin(affiliateTransactions, and(
    eq(affiliateTransactions.orderId, orders.id),
    eq(affiliateTransactions.affiliateId, id),
    eq(affiliateTransactions.type, 'COMMISSION')
  ))
  .where(eq(users.referredBy, id))
  .groupBy(users.id)
  .orderBy(desc(users.createdAt));


  async function updateUser(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const isAffiliate = formData.get('isAffiliate') === 'on';
    const commissionRate = formData.get('commissionRate') as string;
    const balance = formData.get('balance') as string;
    const bio = formData.get('bio') as string;

    await db.update(users)
      .set({
        name,
        isAffiliate,
        commissionRate: commissionRate.replace(',', '.'),
        balance: balance.replace(',', '.'),
        bio
      })
      .where(eq(users.id, id));

    revalidatePath('/admin/customers');
    revalidatePath(`/admin/customers/${id}`);
    redirect('/admin/customers');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link href="/admin/customers" className="flex items-center gap-2 text-gray-500 hover:text-white transition-all w-fit">
        <ArrowLeft className="w-4 h-4" /> Voltar para lista
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="w-8 h-8 text-primary" />
           </div>
           <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tight">Editar Usuário</h1>
              <p className="text-gray-500">{user.email}</p>
           </div>
        </div>
      </div>

      <form action={updateUser} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Basic Info */}
        <div className="bg-[#0A0A0A] border border-[#222] p-8 rounded-[32px] space-y-6">
           <h3 className="text-xl font-bold border-b border-[#222] pb-4 mb-6">Informações Básicas</h3>
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nome Completo</label>
             <input 
               name="name"
               defaultValue={user.name || ''}
               className="w-full bg-[#111] border border-[#222] rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-all"
             />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Saldo Atual (R$)</label>
             <input 
               name="balance"
               defaultValue={Number(user.balance).toFixed(2)}
               className="w-full bg-[#111] border border-[#222] rounded-2xl p-4 text-white font-mono focus:outline-none focus:border-primary transition-all"
             />
           </div>
        </div>

        {/* Affiliate Settings */}
        <div className="bg-primary/5 border border-primary/20 p-8 rounded-[32px] space-y-6">
           <div className="flex items-center justify-between border-b border-primary/10 pb-4 mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                 <DollarSign className="w-5 h-5 text-primary" /> Afiliado
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isAffiliate" 
                  defaultChecked={user.isAffiliate}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
           </div>

           <div>
             <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">Comissão (%)</label>
             <input 
               name="commissionRate"
               type="number"
               step="0.01"
               defaultValue={Number(user.commissionRate)}
               className="w-full bg-[#050505] border border-primary/20 rounded-2xl p-4 text-white font-mono focus:outline-none focus:border-primary transition-all"
             />
           </div>

           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Descrição / Bio do Afiliado</label>
              <textarea 
                name="bio"
                defaultValue={user.bio || ''}
                placeholder="Escreva uma descrição completa sobre o afiliado, parcerias ou observações..."
                rows={4}
                className="w-full bg-[#050505] border border-[#222] rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Código</label>
                  <div className="p-4 bg-black/50 border border-[#222] rounded-2xl text-gray-400 font-mono text-[10px]">
                     {user.affiliateCode || 'N/A'}
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Indicações</label>
                  <div className="p-4 bg-black/50 border border-[#222] rounded-2xl text-primary font-black text-[10px]">
                     {referralsCount} Usuários
                  </div>
               </div>
            </div>

           <div className="p-4 bg-primary/10 rounded-2xl">
              <p className="text-[10px] text-primary font-bold uppercase mb-1 flex items-center gap-2">
                 <Shield className="w-3 h-3" /> Regra de RevShare
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                 O afiliado receberá automaticamente a porcentagem definida sobre cada compra paga pelos usuários indicados por ele.
              </p>
           </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
           <button className="px-10 py-5 bg-primary hover:bg-blue-600 rounded-2xl font-black text-xl transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 uppercase italic flex items-center gap-3">
              <Save className="w-6 h-6" /> Salvar Alterações
           </button>
        </div>

      </form>

      {/* Referrals Detailed Panel */}
      <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] overflow-hidden">
        <div className="p-8 border-b border-[#222] flex items-center justify-between bg-white/[0.01]">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3">
              <UsersIcon className="w-6 h-6 text-primary" /> Detalhamento de Indicações
            </h3>
            <p className="text-xs text-gray-500 mt-1">Lista completa de usuários que se registraram através deste afiliado e o lucro gerado por cada um.</p>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
            <span className="text-[10px] font-black uppercase text-primary">Total: {referralsCount} Usuários</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-gray-500">
                <th className="px-8 py-4 font-black">Usuário Indicado</th>
                <th className="px-8 py-4 font-black">Data de Registro</th>
                <th className="px-8 py-4 font-black text-right">Lucro Gerado (Comissão)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {referredUsersList.map((ref) => (
                <tr key={ref.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold border border-white/10 group-hover:border-primary/30 transition-colors">
                        {ref.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{ref.name}</p>
                        <p className="text-[10px] text-gray-500">{ref.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-gray-400">{new Date(ref.createdAt).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <p className={`text-sm font-black italic ${Number(ref.totalProfit) > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
                        R$ {Number(ref.totalProfit).toFixed(2).replace('.', ',')}
                      </p>
                      {Number(ref.totalProfit) > 0 && (
                        <span className="text-[9px] text-emerald-400/50 uppercase font-bold">Vendas realizadas</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {referredUsersList.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-gray-600 italic text-sm">
                    Este usuário ainda não possui indicações registradas.
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

