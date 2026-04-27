'use client';

// Force TS Server update
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Copy, Check, Clock, AlertCircle, RefreshCw, QrCode, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  orderId: string;
  pixCode: string | null;
  pixQrcodeImage: string | null;
  totalAmount: number | null;
  orderStatus: string;
  initialSecondsLeft: number;
}

const EXPIRY_SECONDS = 15 * 60; // 15 minutes

export default function PixPaymentPanel({
  orderId,
  pixCode,
  pixQrcodeImage,
  totalAmount,
  orderStatus: initialStatus,
  initialSecondsLeft,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);
  const [status, setStatus] = useState(initialStatus);
  const [polling, setPolling] = useState(initialStatus === 'PENDING');

  // Countdown timer
  useEffect(() => {
    if (status !== 'PENDING') return;
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Poll order status every 5 seconds
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status && data.status !== 'PENDING') {
        setStatus(data.status);
        setPolling(false);
      }
    } catch {}
  }, [orderId]);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [polling, checkStatus]);

  const handleCopy = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = pixCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const timerProgress = (secondsLeft / EXPIRY_SECONDS) * 100;

  if (status === 'PAID') {
    return (
      <div className="bg-[#0A0A0A] border border-emerald-500/30 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in duration-500">
        <div className="p-12 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(52,211,153,0.2)]">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tight nasa-title">
            Pagamento Confirmado!
          </h1>
          <p className="text-gray-400 mb-2">Seu pedido foi aprovado e está sendo processado.</p>
          {totalAmount && (
            <p className="text-2xl font-black text-emerald-400 mb-8">
              R$ {totalAmount.toFixed(2).replace('.', ',')}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
            <Link
              href="/profile"
              className="flex-1 py-3 text-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase italic text-sm tracking-widest transition-all"
            >
              Ver Pedidos
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 text-center border border-[#333] text-gray-400 hover:text-white hover:bg-[#111] rounded-2xl font-bold text-sm transition-all"
            >
              Voltar à Loja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'CANCELLED' || secondsLeft === 0) {
    return (
      <div className="bg-[#0A0A0A] border border-red-500/30 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in duration-500">
        <div className="p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tight nasa-title">
            {secondsLeft === 0 ? 'Pagamento Expirado' : 'Pedido Cancelado'}
          </h1>
          <p className="text-gray-400 mb-8">
            {secondsLeft === 0
              ? 'O tempo para pagamento expirou. Por favor, inicie uma nova compra.'
              : 'Este pedido foi cancelado.'}
          </p>
          <Link href="/" className="px-8 py-3 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black uppercase italic text-sm tracking-widest transition-all">
            Voltar à Loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/" className="p-2 text-gray-500 hover:text-white hover:bg-[#111] rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tight nasa-title">
            Finalizar Pagamento
          </h1>
          <p className="text-xs text-gray-500 font-mono">Pedido #{orderId.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code Panel */}
        <div className="bg-[#0A0A0A] border border-[#222] rounded-[28px] p-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <QrCode className="w-5 h-5 text-primary" />
            <p className="text-white font-bold text-sm">QR Code PIX</p>
          </div>

          {pixQrcodeImage ? (
            <div className="relative group">
              <div className="w-52 h-52 rounded-2xl overflow-hidden bg-white p-2 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <img
                  src={pixQrcodeImage.startsWith('data:') ? pixQrcodeImage : `data:image/png;base64,${pixQrcodeImage}`}
                  alt="QR Code PIX"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/40 transition-all duration-300" />
            </div>
          ) : (
            <div className="w-52 h-52 rounded-2xl bg-[#111] border border-[#333] flex flex-col items-center justify-center gap-3 text-gray-500">
              <QrCode className="w-10 h-10" />
              <p className="text-xs text-center px-4">QR Code não disponível</p>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            Escaneie com o app do seu banco
          </p>
        </div>

        {/* Info Panel */}
        <div className="flex flex-col gap-4">
          {/* Amount */}
          {totalAmount !== null && (
            <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Valor a pagar</p>
              <p className="text-3xl font-black text-white">
                R$ <span className="text-primary">{totalAmount.toFixed(2).replace('.', ',')}</span>
              </p>
              <p className="text-[10px] text-emerald-400 mt-1 font-bold uppercase tracking-wider">
                ✓ à vista no Pix — sem taxas
              </p>
            </div>
          )}

          {/* Timer */}
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-400 uppercase tracking-wider">Expira em</p>
              </div>
              <p className={`text-xl font-black font-mono ${secondsLeft < 120 ? 'text-red-400' : 'text-white'}`}>
                {minutes}:{seconds}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${timerProgress}%`,
                  backgroundColor: secondsLeft < 120 ? '#f87171' : secondsLeft < 300 ? '#fb923c' : '#3b82f6',
                }}
              />
            </div>
          </div>

          {/* Status indicator */}
          <div className="bg-[#0A0A0A] border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
              </span>
            </div>
            <div className="flex-1">
              <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Aguardando Pagamento</p>
              <p className="text-gray-500 text-[10px] mt-0.5">A página atualiza automaticamente</p>
            </div>
            <button
              onClick={checkStatus}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-[#222] rounded-lg transition-all"
              title="Verificar agora"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pix Copia e Cola */}
      {pixCode && (
        <div className="bg-[#0A0A0A] border border-[#222] rounded-[28px] p-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold">
            Pix Copia e Cola
          </p>
          <div className="relative">
            <div className="w-full bg-[#111] border border-[#333] rounded-2xl p-4 pr-16 font-mono text-xs text-gray-300 break-all max-h-24 overflow-y-auto custom-scrollbar leading-relaxed">
              {pixCode}
            </div>
            <button
              onClick={handleCopy}
              className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#222] hover:bg-primary text-gray-400 hover:text-white border border-[#333] hover:border-primary'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-[#0A0A0A] border border-[#222] rounded-[28px] p-6">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold">Como pagar</p>
        <ol className="space-y-3">
          {[
            'Abra o aplicativo do seu banco',
            'Vá na área de pagamentos e escolha PIX',
            'Selecione "Pix Copia e Cola" ou escaneie o QR Code',
            'Confirme o valor e finalize o pagamento',
            'A entrega é liberada automaticamente após a confirmação',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
