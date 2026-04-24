'use client';

import { useState } from 'react';
import { requestWithdrawal } from '@/app/actions/withdrawals';
import { Wallet, X, ChevronDown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WithdrawalModalProps {
  balance: number;
  onClose: () => void;
}

const PIX_TYPES = [
  { value: 'CPF',    label: 'CPF' },
  { value: 'CNPJ',   label: 'CNPJ' },
  { value: 'EMAIL',  label: 'E-mail' },
  { value: 'PHONE',  label: 'Telefone' },
  { value: 'RANDOM', label: 'Chave Aleatória' },
];

export default function WithdrawalModal({ balance, onClose }: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('CPF');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const fd = new FormData();
    fd.set('amount', amount);
    fd.set('pixKey', pixKey);
    fd.set('pixKeyType', pixKeyType);

    const result = await requestWithdrawal(fd);

    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Solicitação enviada!');
    } else {
      setStatus('error');
      setMessage(result.error || 'Erro ao processar.');
    }
  }

  const parsedAmount = parseFloat(amount) || 0;
  const isValid = parsedAmount >= 20 && parsedAmount <= balance && pixKey.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-white font-black uppercase italic text-base nasa-title">Solicitar Saque</h2>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Via PIX • Prazo: 48h</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Display */}
        <div className="mx-8 mt-6 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl flex items-center justify-between">
          <p className="text-[11px] text-emerald-400 font-black uppercase tracking-widest">Saldo Disponível</p>
          <p className="text-xl font-black italic text-emerald-400">R$ {balance.toFixed(2).replace('.', ',')}</p>
        </div>

        {status === 'success' ? (
          <div className="px-8 py-10 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-white font-black uppercase italic text-lg mb-2">Solicitação Enviada!</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">{message}</p>
            <button onClick={onClose} className="px-8 py-3 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all">
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            
            {/* Amount */}
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">Valor do Saque</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black text-sm">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="20"
                  max={balance}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-4 bg-[#111] border border-white/5 focus:border-primary/50 rounded-2xl text-white font-black text-base outline-none transition-all placeholder:text-gray-700"
                  required
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <p className="text-[10px] text-gray-700">Mínimo: R$ 20,00</p>
                <button type="button" onClick={() => setAmount(balance.toFixed(2))} className="text-[10px] text-primary font-bold hover:underline">
                  Usar saldo total
                </button>
              </div>
            </div>

            {/* PIX Key Type */}
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">Tipo de Chave PIX</label>
              <div className="relative">
                <select
                  value={pixKeyType}
                  onChange={e => setPixKeyType(e.target.value)}
                  className="w-full px-4 py-4 bg-[#111] border border-white/5 focus:border-primary/50 rounded-2xl text-white font-bold text-sm outline-none appearance-none transition-all"
                >
                  {PIX_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
            </div>

            {/* PIX Key */}
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">Chave PIX</label>
              <input
                type="text"
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder={pixKeyType === 'EMAIL' ? 'email@exemplo.com' : pixKeyType === 'PHONE' ? '+55 (00) 00000-0000' : 'Sua chave PIX'}
                className="w-full px-4 py-4 bg-[#111] border border-white/5 focus:border-primary/50 rounded-2xl text-white font-bold text-sm outline-none transition-all placeholder:text-gray-700"
                required
              />
            </div>

            {/* Error */}
            {status === 'error' && (
              <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-xs font-medium leading-relaxed">{message}</p>
              </div>
            )}

            {/* Info */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] text-gray-600 leading-relaxed space-y-1">
              <p>• O saldo será reservado imediatamente ao solicitar.</p>
              <p>• O pagamento ocorre em até <span className="text-white font-bold">48 horas úteis</span>.</p>
              <p>• Em caso de rejeição, o saldo é devolvido automaticamente.</p>
            </div>

            <button
              type="submit"
              disabled={!isValid || status === 'loading'}
              className="w-full py-4 bg-primary hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase italic text-xs tracking-[0.15em] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
              ) : (
                <><Wallet className="w-4 h-4" /> Solicitar Saque de R$ {parsedAmount > 0 ? parsedAmount.toFixed(2).replace('.', ',') : '0,00'}</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
