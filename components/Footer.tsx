import Link from 'next/link';
import { Rocket, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#02040a] border-t border-white/5 pt-16 pb-8 mt-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 group shrink-0 mb-6 w-fit">
              <img src="/content.png" alt="Bahia Store" className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
              <span 
                className="text-lg font-black tracking-[0.15em] bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent uppercase"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                BAHIA STORE
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
              Sua plataforma premium para assinaturas digitais, contas e softwares. Entrega automática e suporte especializado 24/7.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                <Zap className="w-3.5 h-3.5" />
                Entrega Imediata
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Seguro
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Navegação</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors text-sm">Início</Link></li>
              <li><Link href="/#produtos" className="text-gray-400 hover:text-primary transition-colors text-sm">Catálogo</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-primary transition-colors text-sm">Área do Cliente</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Suporte</h4>
            <ul className="space-y-4">
              <li><Link href="/termos" className="text-gray-400 hover:text-primary transition-colors text-sm">Termos de Serviço</Link></li>
              <li><Link href="/privacidade" className="text-gray-400 hover:text-primary transition-colors text-sm">Privacidade</Link></li>
              <li><span className="text-gray-500 text-sm cursor-not-allowed">Contato</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} BahiaStore. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
            Pagamentos seguros via <span className="text-emerald-400/70 italic font-bold uppercase tracking-wider">Pix</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
