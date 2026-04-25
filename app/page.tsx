import Navbar from '@/components/Navbar';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <main className="min-h-screen pt-16 flex flex-col items-center overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 sm:py-24">

        {/* ── Background: animated grid + glows ── */}

        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full -z-10"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full -z-10"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.10) 0%, transparent 70%)' }}
        />

        {/* ── Live badge ── */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-10 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Entrega Automática 24/7
        </div>

        {/* ── Main headline: oversized split layout ── */}
        <div className="relative w-full max-w-6xl mx-auto">



          <h1 className="relative text-center font-black tracking-tighter leading-[0.88] uppercase mb-8">
            {/* Row 1 */}
            <span className="block text-[clamp(3rem,9vw,7.5rem)] text-white italic">
              Acesso
            </span>
            {/* Row 2: outlined + filled mix */}
            <span className="block text-[clamp(3rem,10vw,8.5rem)] italic"
              style={{
                WebkitTextStroke: '2px rgba(59,130,246,0.7)',
                color: 'transparent',
              }}
            >
              Premium
            </span>
            {/* Row 3: gradient fill */}
            <span
              className="block text-[clamp(2.5rem,8vw,7rem)] italic text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(90deg, #38bdf8 0%, #3b82f6 50%, #818cf8 100%)',
              }}
            >
              Instantâneo
            </span>
          </h1>

          {/* ── Horizontal divider with stats ── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 py-8 mb-12">
            {[
              { value: '50K+', label: 'Clientes Satisfeitos' },
              { value: '99.9%', label: 'Uptime Garantido' },
              { value: '<1min', label: 'Entrega Média' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-3xl md:text-4xl font-black text-white tracking-tight">{value}</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{label}</span>
              </div>
            ))}
          </div>

          {/* ── Sub-text + CTAs ── */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 lg:order-1">
              <Link
                href="#produtos"
                className="group relative overflow-hidden flex items-center gap-3 px-9 py-4 rounded-2xl font-black italic uppercase tracking-widest text-sm text-white transition-all shadow-[0_15px_40px_rgba(59,130,246,0.35)]"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
              >
                {/* hover shimmer */}
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                />
                <ShoppingCart className="w-5 h-5" />
                Ver Produtos
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </div>
            
            <p className="text-base md:text-lg text-gray-400 max-w-sm leading-relaxed text-center lg:text-left font-medium lg:order-2">
              A maior plataforma de produtos digitais. Receba seus acessos
              imediatamente após o pagamento.
            </p>
          </div>
        </div>

      </section>

      {/* ── FLOATING LOGOS CAROUSEL ── */}
      <div className="w-full py-6 sm:py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-10">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-gray-500 italic">
              Tudo que você gosta em um só lugar
            </span>
          </div>
          <div 
            className="w-full"
            style={{ maskImage: 'linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%)' }}
          >
            <div 
              className="flex items-center whitespace-nowrap"
              style={{ 
                animation: 'marquee-logos 30s linear infinite',
                width: 'max-content'
              }}
            >
              {/* Double the logos for infinite scroll */}
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-20 md:gap-32 items-center px-10 md:px-16">
                  <img src="/2560px-Netflix_2015_logo.svg.png" alt="Netflix" className="h-6 md:h-7 w-auto opacity-30 hover:opacity-100 hover:scale-110 transition-all duration-500 filter grayscale brightness-200 hover:grayscale-0 hover:brightness-100" />
                  <img src="/hbo.png" alt="HBO" className="h-6 md:h-7 w-auto opacity-30 hover:opacity-100 hover:scale-110 transition-all duration-500 filter grayscale brightness-200 hover:grayscale-0 hover:brightness-100" />
                  <img src="/prime.png" alt="Amazon Prime" className="h-7 md:h-9 w-auto opacity-30 hover:opacity-100 hover:scale-110 transition-all duration-500 filter grayscale brightness-200 hover:grayscale-0 hover:brightness-100" />
                  <img src="/disney.png" alt="Disney" className="h-8 md:h-10 w-auto opacity-30 hover:opacity-100 hover:scale-110 transition-all duration-500 filter grayscale brightness-200 hover:grayscale-0 hover:brightness-100" />
                  <img src="/globoplay-logo-0-1.png" alt="Globoplay" className="h-6 md:h-8 w-auto opacity-30 hover:opacity-100 hover:scale-110 transition-all duration-500 filter grayscale brightness-200 hover:grayscale-0 hover:brightness-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes marquee-logos {
            from { transform: translateX(0) }
            to   { transform: translateX(-50%) }
          }
        `}</style>
      </div>

      <ProductGrid currentCategory={category} />
      <Footer />
    </main>
  );
}
