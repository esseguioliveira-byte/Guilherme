import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { withdrawalRequests, users } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { Wallet, Clock, CheckCircle, XCircle, TrendingDown } from 'lucide-react';
import WithdrawalActions from '@/components/WithdrawalActions';

export default async function AdminWithdrawalsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  // Fetch all withdrawals joined with user name
  const requests = await db
    .select({
      id: withdrawalRequests.id,
      amount: withdrawalRequests.amount,
      pixKey: withdrawalRequests.pixKey,
      pixKeyType: withdrawalRequests.pixKeyType,
      status: withdrawalRequests.status,
      adminNote: withdrawalRequests.adminNote,
      createdAt: withdrawalRequests.createdAt,
      resolvedAt: withdrawalRequests.resolvedAt,
      affiliateName: users.name,
      affiliateEmail: users.email,
      affiliateId: users.id,
    })
    .from(withdrawalRequests)
    .innerJoin(users, eq(withdrawalRequests.affiliateId, users.id))
    .orderBy(desc(withdrawalRequests.createdAt));

  // Stats
  const pending  = requests.filter(r => r.status === 'PENDING');
  const approved = requests.filter(r => r.status === 'APPROVED');
  const rejected = requests.filter(r => r.status === 'REJECTED');
  const totalPaid = approved.reduce((s, r) => s + parseFloat(r.amount as string), 0);

  const statusStyles: Record<string, string> = {
    PENDING:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const statusLabels: Record<string, string> = {
    PENDING: 'Pendente', APPROVED: 'Aprovado', REJECTED: 'Rejeitado',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">Saques de Afiliados</h1>
        <p className="text-gray-500 mt-1 text-sm">Gerencie e processe as solicitações de saque via PIX.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-yellow-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest">Pendentes</p>
          </div>
          <p className="text-3xl font-black text-white">{pending.length}</p>
        </div>
        <div className="bg-[#0A0A0A] border border-emerald-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Aprovados</p>
          </div>
          <p className="text-3xl font-black text-white">{approved.length}</p>
        </div>
        <div className="bg-[#0A0A0A] border border-red-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Rejeitados</p>
          </div>
          <p className="text-3xl font-black text-white">{rejected.length}</p>
        </div>
        <div className="bg-[#0A0A0A] border border-primary/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">Total Pago</p>
          </div>
          <p className="text-3xl font-black text-emerald-400 italic">R$ {totalPaid.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      {/* Pending - highlighted first */}
      {pending.length > 0 && (
        <div className="bg-[#0A0A0A] border border-yellow-500/15 rounded-[32px] overflow-hidden">
          <div className="px-8 py-5 border-b border-yellow-500/10 flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <h2 className="text-base font-black text-yellow-400 uppercase tracking-widest">Aguardando Aprovação ({pending.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111]/50 text-[10px] uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-4 font-black">Afiliado</th>
                  <th className="px-6 py-4 font-black">Valor</th>
                  <th className="px-6 py-4 font-black">Chave PIX</th>
                  <th className="px-6 py-4 font-black">Tipo</th>
                  <th className="px-6 py-4 font-black">Solicitado em</th>
                  <th className="px-6 py-4 font-black text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {pending.map(r => (
                  <tr key={r.id} className="hover:bg-[#111]/30 transition-all">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-white">{r.affiliateName}</p>
                      <p className="text-[10px] text-gray-600">{r.affiliateEmail}</p>
                    </td>
                    <td className="px-6 py-5 text-lg font-black italic text-emerald-400">
                      R$ {Number(r.amount).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-5 font-mono text-sm text-gray-300">{r.pixKey}</td>
                    <td className="px-6 py-5 text-[10px] text-gray-500 font-black uppercase">{r.pixKeyType}</td>
                    <td className="px-6 py-5 text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <WithdrawalActions
                        id={r.id}
                        affiliateName={r.affiliateName || ''}
                        amount={Number(r.amount).toFixed(2).replace('.', ',')}
                        pixKey={r.pixKey}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full History */}
      <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] overflow-hidden">
        <div className="px-8 py-5 border-b border-[#222]">
          <h2 className="text-base font-black text-white uppercase tracking-widest">Histórico Completo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#111]/50 text-[10px] uppercase tracking-widest text-gray-500">
                <th className="px-6 py-4 font-black">Afiliado</th>
                <th className="px-6 py-4 font-black">Valor</th>
                <th className="px-6 py-4 font-black">Chave PIX</th>
                <th className="px-6 py-4 font-black">Data</th>
                <th className="px-6 py-4 font-black text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {requests.map(r => (
                <tr key={r.id} className="hover:bg-[#111]/30 transition-all">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">{r.affiliateName}</p>
                    <p className="text-[10px] text-gray-600">{r.affiliateEmail}</p>
                  </td>
                  <td className="px-6 py-4 font-black italic text-white">R$ {Number(r.amount).toFixed(2).replace('.', ',')}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">
                    <span>{r.pixKey}</span>
                    <span className="ml-2 text-[9px] text-gray-600 uppercase">{r.pixKeyType}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${statusStyles[r.status]}`}>
                        {statusLabels[r.status]}
                      </span>
                      {r.adminNote && r.status === 'REJECTED' && (
                        <p className="text-[9px] text-red-400 max-w-[200px] text-right italic">{r.adminNote}</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-600 italic text-sm">
                    Nenhum saque solicitado ainda.
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
