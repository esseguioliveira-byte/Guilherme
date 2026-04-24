import { Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/db';
import { users } from '@/db/schema';

import { eq, and, or, like } from 'drizzle-orm';

import { Users, Percent, Save, Search, ArrowRight } from 'lucide-react';
import { updateAffiliateCommission } from '@/app/actions/admin';
import { revalidatePath } from 'next/cache';
import SearchInput from '@/components/admin/SearchInput';

export default async function AdminAffiliatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q;
  
  const affiliates = await db.select()
    .from(users)
    .where(
      and(
        eq(users.isAffiliate, true),
        query ? or(
          like(users.name, `%${query}%`),
          like(users.email, `%${query}%`)
        ) : undefined
      )
    );


  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> Gerenciar Afiliados
          </h1>
          <p className="text-gray-500">Ajuste as taxas de comissão e visualize o desempenho dos parceiros.</p>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <Suspense fallback={<div className="h-10 bg-black/60 border border-white/10 rounded-xl animate-pulse" />}>
            <SearchInput placeholder="Buscar por nome ou email..." />
          </Suspense>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-gray-500">
                <th className="px-8 py-5 font-black">Afiliado</th>
                <th className="px-8 py-5 font-black">Código</th>
                <th className="px-8 py-5 font-black">Saldo</th>
                <th className="px-8 py-5 font-black">Taxa de Comissão (%)</th>
                <th className="px-8 py-5 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                        <span className="text-primary font-bold text-sm">{affiliate.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{affiliate.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{affiliate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-mono text-primary uppercase">
                      {affiliate.affiliateCode || 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-emerald-400 italic">R$ {Number(affiliate.balance).toFixed(2)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <form 
                      action={async (formData: FormData) => {
                        'use server';
                        const rate = formData.get('rate') as string;
                        await updateAffiliateCommission(affiliate.id, rate);
                      }}
                      className="flex items-center gap-2"
                    >
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                        <input 
                          name="rate"
                          type="number" 
                          step="0.01"
                          defaultValue={Number(affiliate.commissionRate)}
                          className="w-24 bg-black/60 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-xs focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-all border border-primary/20"
                        title="Salvar Comissão"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link 
                      href={`/admin/affiliates/${affiliate.id}`}
                      className="text-[10px] font-black uppercase text-primary hover:text-white transition-colors flex items-center justify-end gap-1"
                    >
                      Ver Detalhes <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>

                </tr>
              ))}
              {affiliates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-600 italic">
                    Nenhum afiliado encontrado no sistema.
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
