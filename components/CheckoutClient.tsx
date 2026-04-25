'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShieldCheck, Ticket, Check, Minus, Plus, X, Loader2, Zap, Tag, CheckCircle2, Home } from 'lucide-react';
import { processCartPurchase } from '@/app/actions/cart-checkout';
import { validateCoupon } from '@/app/actions/coupons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutClient({ user }: { user: any }) {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const router = useRouter();

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    discount: number;
  } | null>(null);

  const discount = appliedCoupon?.discount || 0;
  const finalPrice = Math.max(0, totalPrice - discount);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
        <button onClick={() => router.push('/')} className="bg-primary hover:bg-blue-600 px-6 py-3 rounded-xl font-medium transition-colors">Voltar para a loja</button>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);
    try {
      const result = await validateCoupon(couponInput, totalPrice);
      if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon as any);
      } else {
        setCouponError(result.error || 'Cupom inválido.');
      }
    } catch {
      setCouponError('Erro ao validar cupom.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (!acceptedTerms) {
      setError('Você precisa aceitar os termos e condições.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const itemsPayload = items.map(i => ({ productId: i.product.id, quantity: i.quantity }));
      const response = await processCartPurchase(itemsPayload, appliedCoupon?.code, email);

      if (response.success && response.orderId) {
        clearCart();
        console.log('[CheckoutClient] Redirecionando para a página do pedido:', response.orderId);
        // Passando apenas o timestamp atual para o cálculo do timer, evitando problemas
        // de fuso horário do banco de dados na máquina local.
        router.push(`/orders/${response.orderId}?t=${Date.now()}`);
      } else {
        console.error('[CheckoutClient] Erro na resposta:', response.error);
        setError(response.error || 'Erro ao processar a compra.');
      }
    } catch (err) {
      setError('Erro inesperado de rede.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 lg:py-12 mt-16">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4">
           <Link href="/" className="hover:text-primary flex items-center gap-2 transition-colors">
              <Home className="w-4 h-4" /> Início
           </Link>
           <span>/</span>
           <span className="text-white font-bold">Checkout</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Finalizar Compra</h1>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Coluna Esquerda */}
        <div className="flex-1 w-full space-y-8">
          
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center border border-primary/30">1</span>
              Formas de pagamento
            </h2>
            <div className="border-2 border-primary bg-primary/5 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden transition-all">
               <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-[#050505] border border-[#222] rounded-xl flex items-center justify-center shadow-inner">
                   <div className="w-6 h-6 text-[#32BCAD] flex flex-wrap gap-[2px]">
                      <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                      <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                      <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                      <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                   </div>
                 </div>
                 <div>
                   <div className="text-white text-lg font-bold flex items-center gap-3">
                     Pix 
                     <span className="text-[11px] text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1 font-bold uppercase tracking-wider">
                       <Zap className="w-3 h-3" /> Mais rápido
                     </span>
                   </div>
                   <div className="text-sm text-gray-400">Aprovação imediata e entrega automática</div>
                 </div>
               </div>
               <div className="w-6 h-6 rounded-full border-[6px] border-primary bg-white shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center border border-primary/30">2</span>
              Informações de contato
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 ml-1">Nome completo</label>
                <input type="text" readOnly value={user?.name || ''} className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-white outline-none cursor-not-allowed opacity-60 focus:border-primary/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 ml-1">E-mail para entrega</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-white outline-none focus:border-primary/50 transition-all" 
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Seus dados estão seguros e serão usados apenas para a entrega do produto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-gray-300 font-medium">Garantia de Funcionamento</span>
             </div>
             <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-gray-300 font-medium">Suporte 24/7 Especializado</span>
             </div>
             <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-gray-300 font-medium">Entrega em Instantes</span>
             </div>
          </div>

          <div className="space-y-6 pt-6">
            <label className="flex items-start gap-4 cursor-pointer group bg-[#111]/30 p-4 rounded-xl border border-transparent hover:border-[#222] transition-all">
              <div className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${acceptedTerms ? 'bg-primary border-primary shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'border-[#333] group-hover:border-primary/40'}`}>
                {acceptedTerms && <Check className="w-4 h-4 text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                Ao finalizar, você concorda com nossos <span className="text-white font-bold underline decoration-primary/30 underline-offset-4">termos de uso</span> e confirma que os dados de contato estão corretos para a entrega digital.
              </span>
            </label>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button 
              onClick={handleCheckout}
              disabled={isSubmitting || !acceptedTerms}
              className="w-full py-5 rounded-2xl bg-primary hover:bg-blue-600 disabled:bg-[#1a1a1a] disabled:text-gray-600 text-white font-black text-xl transition-all shadow-[0_20px_40px_rgba(59,130,246,0.25)] hover:shadow-[0_25px_50px_rgba(59,130,246,0.4)] disabled:shadow-none flex justify-center items-center gap-3 active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : `FINALIZAR PAGAMENTO • R$ ${finalPrice.toFixed(2).replace('.', ',')}`}
            </button>
          </div>

        </div>

        {/* Coluna Direita: Resumo */}
        <div className="w-full xl:w-[480px] shrink-0 lg:sticky lg:top-24">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222]">
              <h2 className="text-xl font-bold text-white tracking-tight">Resumo do pedido</h2>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                Seguro
              </div>
            </div>

            <div className="space-y-6 mb-8 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 group items-center">
                  <div className="w-14 h-14 bg-[#111] rounded-xl overflow-hidden shrink-0 border border-[#222] group-hover:border-primary/30 transition-colors">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <span className="text-[10px] text-gray-600 h-full flex items-center justify-center uppercase">No pix</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-black text-white uppercase truncate mb-0.5 group-hover:text-primary transition-colors">
                      {item.product.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500">R$ {Number(item.product.price).toFixed(2).replace('.', ',')}</span>
                      <span className="text-[10px] text-gray-700">×</span>
                      <span className="text-[10px] font-bold text-white">{item.quantity}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1 bg-[#111] border border-[#222] rounded-lg p-0.5 shadow-inner">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-all active:scale-90">
                        <Minus className="w-3 h-3" />
                      </button>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-all active:scale-90">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)} className="w-6 h-6 flex items-center justify-center hover:bg-red-500/10 rounded-md text-gray-500 hover:text-red-500 transition-all ml-0.5 border-l border-[#222] active:scale-90">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-black text-white tracking-tight">
                      R$ {(Number(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mb-6">
              {!appliedCoupon ? (
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Código de cupom"
                      className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pl-4 pr-12 text-sm text-white outline-none focus:border-primary/50 transition-all uppercase tracking-widest placeholder-normal"
                      style={{ textTransform: 'uppercase' }}
                    />
                    <Ticket className="w-5 h-5 text-gray-600 absolute right-4 top-1/2 -translate-y-1/2 group-hover:text-primary transition-colors" />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="bg-[#111] border border-[#222] hover:bg-[#1a1a1a] hover:border-primary/30 disabled:opacity-50 text-white font-bold text-sm px-6 py-4 rounded-xl transition-all active:scale-95 flex items-center gap-2"
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">{appliedCoupon.code}</p>
                      <p className="text-[10px] text-emerald-400/60 font-medium">
                        {appliedCoupon.type === 'PERCENTAGE'
                          ? `${appliedCoupon.value}% de desconto`
                          : `R$ ${appliedCoupon.value.toFixed(2).replace('.', ',')} de desconto`}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-2">
                  <X className="w-3 h-3" /> {couponError}
                </p>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-[#222]">
              <div className="flex justify-between text-xs text-gray-400">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-gray-300">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span className="font-medium flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Cupom ({appliedCoupon.code})
                  </span>
                  <span className="font-black">- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400">
                <span className="font-medium">Processamento</span>
                <span className="text-green-400 font-bold uppercase text-[9px] bg-green-500/10 px-1.5 py-0.5 rounded">Grátis</span>
              </div>
              <div className="flex justify-between text-xl font-black text-white pt-3 border-t border-dashed border-[#333] mt-2">
                <span className="tracking-tighter">TOTAL</span>
                <span className="text-primary">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <p className="text-[10px] text-center text-gray-500 mt-4 font-medium uppercase tracking-widest">
                Aprovação via Pix em segundos
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
