'use client';

import { useState } from 'react';
import { approveWithdrawal, rejectWithdrawal } from '@/app/actions/withdrawals';
import { CheckCircle, XCircle, Loader2, ChevronDown } from 'lucide-react';

interface WithdrawalActionsProps {
  id: string;
  affiliateName: string;
  amount: string;
  pixKey: string;
}

export default function WithdrawalActions({ id, affiliateName, amount, pixKey }: WithdrawalActionsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null);
  const [error, setError] = useState('');

  async function handleApprove() {
    if (!confirm(`Confirmar pagamento de R$ ${amount} para ${affiliateName} via PIX (${pixKey})?`)) return;
    setLoading('approve');
    const result = await approveWithdrawal(id);
    if (result.success) setDone('approved');
    else setError(result.error || 'Erro ao aprovar.');
    setLoading(null);
  }

  async function handleReject() {
    setLoading('reject');
    const result = await rejectWithdrawal(id, rejectNote);
    if (result.success) setDone('rejected');
    else setError(result.error || 'Erro ao rejeitar.');
    setLoading(null);
    setShowReject(false);
  }

  if (done === 'approved') return (
    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase">✓ Aprovado</span>
  );
  if (done === 'rejected') return (
    <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[9px] font-black uppercase">✗ Rejeitado</span>
  );

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-red-400 text-[10px]">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={handleApprove}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-xl transition-all disabled:opacity-50"
        >
          {loading === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
          Aprovar
        </button>
        <button
          onClick={() => setShowReject(!showReject)}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-black uppercase rounded-xl transition-all disabled:opacity-50"
        >
          <XCircle className="w-3 h-3" />
          Rejeitar
          <ChevronDown className={`w-3 h-3 transition-transform ${showReject ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showReject && (
        <div className="flex flex-col items-end gap-2 w-full mt-1 animate-in slide-in-from-top-2 duration-200">
          <input
            type="text"
            value={rejectNote}
            onChange={e => setRejectNote(e.target.value)}
            placeholder="Motivo da rejeição (opcional)"
            className="w-full px-3 py-2 bg-[#0A0A0A] border border-red-500/20 rounded-xl text-xs text-white placeholder:text-gray-700 outline-none"
          />
          <button
            onClick={handleReject}
            disabled={!!loading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading === 'reject' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
            Confirmar Rejeição
          </button>
        </div>
      )}
    </div>
  );
}
