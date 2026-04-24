import Navbar from '@/components/Navbar';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <main className="min-h-screen pt-16 flex flex-col items-center">
      <Navbar />
      
      {/* Hero Section */}
      <section className="w-full py-20 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl flex flex-col items-center">
          <div
            data-scroll="zoom"
            style={{ '--scroll-delay': '0ms' } as React.CSSProperties}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Entrega Automática 24/7
          </div>
          
          <h1
            data-scroll="up"
            style={{ '--scroll-delay': '100ms' } as React.CSSProperties}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
          >
            Acesso <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Premium</span><br />
            ao Seu Alcance
          </h1>
          
          <p
            data-scroll="fade"
            style={{ '--scroll-delay': '220ms' } as React.CSSProperties}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            Plataforma segura e instantânea para compra de assinaturas digitais, VPNs e softwares. Garantia de funcionamento.
          </p>
          
          <div
            data-scroll="up"
            style={{ '--scroll-delay': '340ms' } as React.CSSProperties}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-full font-medium transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)] w-full sm:w-auto">
              Ver Produtos
            </button>
            <button className="px-8 py-4 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-white rounded-full font-medium transition-colors w-full sm:w-auto">
              Como Funciona
            </button>
          </div>
        </div>
      </section>


      <ProductGrid currentCategory={category} />

      <Footer />
    </main>
  );
}
