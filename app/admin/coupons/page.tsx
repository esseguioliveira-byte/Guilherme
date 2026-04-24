import { db } from '@/db';
import { coupons } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Percent, DollarSign } from 'lucide-react';
import { createCoupon, deleteCoupon, toggleCoupon } from '@/app/actions/coupons';
import Link from 'next/link';

export default async function AdminCouponsPage() {
  const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
            <Tag className="w-8 h-8 text-amber-400" /> Cupons de Desconto
          </h1>
          <p className="text-gray-500 mt-1">Crie e gerencie códigos de desconto para sua loja.</p>
        </div>
        <div className="bg-amber-400/10 px-4 py-2 rounded-xl border border-amber-400/20">
          <span className="text-[10px] font-black uppercase text-amber-400">{allCoupons.length} Cupons cadastrados</span>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-[#0A0A0A] border border-[#222] rounded-[2rem] p-8">
        <h2 className="text-lg font-black uppercase italic text-white mb-6 flex items-center gap-3">
          <Plus className="w-5 h-5 text-primary" /> Novo Cupom
        </h2>
        <form action={createCoupon} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Código *</label>
            <input
              name="code"
              required
              placeholder="EX: PROMO20"
              className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-white font-mono uppercase text-sm outline-none focus:border-primary transition-all"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Tipo de Desconto *</label>
            <select
              name="type"
              className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-white text-sm outline-none focus:border-primary transition-all appearance-none"
            >
              <option value="PERCENTAGE">Percentual (%)</option>
              <option value="FIXED">Valor Fixo (R$)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Valor *</label>
            <input
              name="value"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="20"
              className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Pedido Mínimo (R$)</label>
            <input
              name="minOrderAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Limite de Usos (vazio = ilimitado)</label>
            <input
              name="maxUses"
              type="number"
              min="1"
              placeholder="∞ Ilimitado"
              className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Expira em (vazio = sem expiração)</label>
            <input
              name="expiresAt"
              type="datetime-local"
              className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-white text-sm outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-10 py-4 bg-primary hover:bg-blue-600 rounded-xl font-black uppercase italic text-white transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Criar Cupom
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                <th className="px-8 py-5 font-black">Código</th>
                <th className="px-8 py-5 font-black">Desconto</th>
                <th className="px-8 py-5 font-black">Mínimo</th>
                <th className="px-8 py-5 font-black">Usos</th>
                <th className="px-8 py-5 font-black">Expiração</th>
                <th className="px-8 py-5 font-black">Status</th>
                <th className="px-8 py-5 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allCoupons.map((coupon) => {
                const isExpired = coupon.expiresAt && coupon.expiresAt < new Date();
                const isFull = coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses;
                return (
                  <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center border border-amber-400/20">
                          <Tag className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="font-black text-white font-mono text-sm tracking-widest">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {coupon.type === 'PERCENTAGE' ? (
                          <Percent className="w-4 h-4 text-primary" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="text-sm font-black text-white">
                          {coupon.type === 'PERCENTAGE'
                            ? `${Number(coupon.value)}%`
                            : `R$ ${Number(coupon.value).toFixed(2).replace('.', ',')}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-gray-400 font-mono">
                        {Number(coupon.minOrderAmount) > 0
                          ? `R$ ${Number(coupon.minOrderAmount).toFixed(2).replace('.', ',')}`
                          : '—'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-xs font-black ${isFull ? 'text-red-400' : 'text-gray-400'}`}>
                        {coupon.currentUses} / {coupon.maxUses ?? '∞'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-xs ${isExpired ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString('pt-BR')
                          : '—'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {isExpired || isFull ? (
                        <span className="text-[10px] font-black uppercase text-red-400 bg-red-400/10 px-2 py-1 rounded-lg">Esgotado</span>
                      ) : coupon.isActive ? (
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">Ativo</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-gray-500 bg-white/5 px-2 py-1 rounded-lg">Inativo</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle */}
                        <form action={async () => {
                          'use server';
                          await toggleCoupon(coupon.id, !coupon.isActive);
                        }}>
                          <button
                            type="submit"
                            className={`p-2 rounded-lg transition-colors ${coupon.isActive ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-gray-600 hover:bg-white/5'}`}
                            title={coupon.isActive ? 'Desativar' : 'Ativar'}
                          >
                            {coupon.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                        </form>
                        {/* Delete */}
                        <form action={async () => {
                          'use server';
                          await deleteCoupon(coupon.id);
                        }}>
                          <button
                            type="submit"
                            className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {allCoupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-600 italic text-sm">
                    Nenhum cupom cadastrado ainda.
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
