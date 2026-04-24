'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, Clock, MessageCircle, Mail, ChevronRight, MessageSquare, ChevronDown, DollarSign } from 'lucide-react';

export default function SupportDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const faqData = [
    { q: "Como recebo meu produto?", a: "A entrega é automática via e-mail e no seu painel do cliente logo após a confirmação do pagamento." },
    { q: "Quais as formas de pagamento?", a: "Atualmente aceitamos Pix com aprovação imediata e entrega instantânea." },
    { q: "O produto tem garantia?", a: "Sim, todos os nossos produtos possuem garantia total contra quedas ou problemas de acesso." },
    { q: "Como renovar minha assinatura?", a: "Basta realizar uma nova compra do mesmo produto ou entrar em contato com o suporte." }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowFAQ(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all flex items-center justify-center border ${
          isOpen ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
        }`}
        title="Central de Apoio"
      >
        <HelpCircle className="w-4.5 h-4.5" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-black border border-white/10 rounded-2xl overflow-hidden z-[100] animate-in fade-in zoom-in duration-200 shadow-[0_20px_50px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/5 bg-black">

            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em] nasa-title">Central de Apoio</h3>
          </div>

          <div className="p-3 space-y-2">
            
            {/* Horário de Funcionamento */}
            <div className="p-4 bg-[#050505] border border-white/5 rounded-xl flex items-center gap-4">
              <div className="w-2 h-10 bg-primary/40 rounded-full shrink-0" />
              <div>
                <p className="text-[11px] text-primary font-black uppercase tracking-widest leading-none mb-1">Status: Online</p>
                <p className="text-[13px] text-slate-200 font-bold leading-tight italic">Seg a Sáb • 09h às 22h</p>
              </div>
            </div>

            {/* WhatsApp */}
            <a 
              href="https://wa.me/5500000000000" 
              target="_blank" 
              className="p-4 bg-[#050505] border border-white/5 hover:border-emerald-500/30 rounded-xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-emerald-500/40 rounded-full shrink-0" />
                <div>
                  <p className="text-[11px] text-emerald-400 font-black uppercase tracking-widest leading-none mb-1">WhatsApp</p>
                  <p className="text-[13px] text-slate-200 font-bold">Protocolo Imediato</p>
                </div>
              </div>
            </a>

            {/* FAQ Toggle */}
            <button 
              onClick={() => setShowFAQ(!showFAQ)}
              className="w-full p-4 bg-[#050505] border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-blue-500/40 rounded-full shrink-0" />
                <div>
                  <p className="text-[11px] text-blue-400 font-black uppercase tracking-widest leading-none mb-1">Knowledge</p>
                  <p className="text-[13px] text-slate-200 font-bold text-left">Perguntas Frequentes</p>
                </div>
              </div>
            </button>

            {/* FAQ Content */}
            {showFAQ && (
              <div className="px-1 py-1 space-y-2 animate-in slide-in-from-top-1 duration-200">
                {faqData.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#080808] border border-white/5 rounded-lg">
                    <p className="text-[11px] font-black text-slate-200 mb-1 italic uppercase tracking-wider">{item.q}</p>
                    <p className="text-[11px] text-gray-500 leading-normal font-medium">{item.a}</p>
                  </div>
                ))}
              </div>
            )}

            {/* E-mail */}
            <div className="p-4 bg-[#050505] border border-white/5 rounded-xl flex items-center gap-4">
              <div className="w-2 h-10 bg-slate-500/40 rounded-full shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">E-mail</p>
                <p className="text-[13px] text-slate-200 font-bold truncate">contato@bahiasstore.com</p>
              </div>
            </div>

            {/* Mini Landing Page para Afiliados */}
            <div className="mt-4 p-6 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-black border border-primary/20 relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-700" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2 py-0.5 bg-primary text-[10px] font-black uppercase tracking-widest rounded-md text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]">Novo</div>
                  <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] italic">Partnership Program</span>
                </div>
                
                <h4 className="text-base font-black text-white uppercase italic leading-tight mb-3">
                  Ganhe dinheiro <br /> <span className="text-primary">indicando nossa loja!</span>
                </h4>
                
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-5">
                  Receba comissões generosas por cada venda realizada através do seu link exclusivo.
                </p>

                <Link 
                  href="/profile/affiliate" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-primary hover:bg-blue-600 rounded-2xl text-xs font-black uppercase italic tracking-[0.15em] text-white transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  Seja um Parceiro
                  <ChevronRight className="w-4 h-4" strokeWidth={3} />
                </Link>
              </div>
            </div>

          </div>

          <div className="py-3 bg-black text-center border-t border-white/5">
            <p className="text-[10px] text-gray-700 uppercase tracking-[0.3em] font-black italic">SUPPORT CENTER</p>
          </div>

        </div>
      )}


    </div>
  );
}
