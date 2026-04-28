'use client';

import { useState } from 'react';
import { requestWithdrawal } from '@/app/actions/withdrawals';
import { Wallet, ChevronDown, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PIX_TYPES = [
  { value: 'CPF',    label: 'CPF' },
  { value: 'CNPJ',   label: 'CNPJ' },
  { value: 'EMAIL',  label: 'E-mail' },
  { value: 'PHONE',  label: 'Telefone' },
  { value: 'RANDOM', label: 'Chave Aleatória' },
];

export default function WithdrawalForm({ balance }: { balance: number }) {
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('CPF');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;
    
    setStatus('loading');
    setMessage('');

    try {
      const fd = new FormData();
      fd.set('amount', amount);
      fd.set('pixKey', pixKey);
      fd.set('pixKeyType', pixKeyType);

      const result = await requestWithdrawal(fd);

      if ('error' in result) {
        setStatus('error');
        setMessage(result.error || 'Não foi possível processar sua solicitação no momento.');
      } else {
        setStatus('success');
        setMessage(result.message || 'Sua solicitação foi enviada com sucesso e será processada em breve.');
        setAmount('');
        setPixKey('');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setStatus('error');
      setMessage('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  const parsedAmount = parseFloat(amount) || 0;
  const isValid = parsedAmount >= 20 && parsedAmount <= balance && pixKey.trim();

  if (status === 'success') {
    return (
      <div className="glass-card rounded-[2.5rem] p-12 text-center border border-emerald-500/10">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase italic mb-4">Solicitação Enviada!</h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">{message}</p>
        <Link 
          href="/affiliates/dashboard" 
          className="inline-flex items-center gap-2 px-10 py-4 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all shadow-lg shadow-primary/20"
        >
          Voltar ao Painel
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/affiliates/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Configurar Saque</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Saldo Disponível</p>
          <p className="text-xl font-black italic text-emerald-400">R$ {balance.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full pl-10 pr-4 py-4 bg-[#050505] border border-white/5 focus:border-primary/50 rounded-2xl text-white font-black text-base outline-none transition-all placeholder:text-gray-800"
                required
              />
            </div>
            <div className="flex justify-between mt-2">
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
                className="w-full px-4 py-4 bg-[#050505] border border-white/5 focus:border-primary/50 rounded-2xl text-white font-bold text-sm outline-none appearance-none transition-all"
              >
                {PIX_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
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
            className="w-full px-4 py-4 bg-[#050505] border border-white/5 focus:border-primary/50 rounded-2xl text-white font-bold text-sm outline-none transition-all placeholder:text-gray-800"
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
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] text-gray-500 leading-relaxed space-y-2">
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            O saldo será reservado imediatamente ao solicitar.
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            O pagamento ocorre em até <span className="text-white font-bold">48 horas úteis</span>.
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Em caso de rejeição, o saldo é devolvido automaticamente para sua conta.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isValid || status === 'loading'}
          className="w-full py-5 bg-primary hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase italic text-xs tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95"
        >
          {status === 'loading' ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
          ) : (
            <><Wallet className="w-5 h-5" /> Confirmar Solicitação de Saque</>
          )}
        </button>
      </form>
    </div>
  );
}
