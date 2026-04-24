import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and, ne, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ShieldCheck, Zap, CreditCard, FileText, Sparkles, Layers } from 'lucide-react';
import ProductPurchaseCard from './ProductPurchaseCard';
import ProductCard from '@/components/ProductCard';

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const productList = await db.select().from(products).where(eq(products.id, id));
  const product = productList[0];

  if (!product) {
    notFound();
  }

  // Fetch sub-products (variations/plans)
  const subProducts = await db
    .select()
    .from(products)
    .where(eq(products.parentId, product.id));

  // Fetch similar products in the same category
  const similarProducts = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.category, product.category),
        ne(products.id, product.id),
        isNull(products.parentId) // Only show main products as similar
      )
    )
    .limit(4);


  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-16">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          {/* Main Image */}
          <div className="bg-[#0A0A0A] border border-[#222] rounded-[2.5rem] overflow-hidden aspect-[16/9] flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 font-medium">Sem Imagem</span>
            )}
            <div className="absolute top-6 left-6">
              <span className="bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] px-4 py-2 rounded-full text-primary font-black uppercase tracking-widest nasa-title">
                {product.category}
              </span>
            </div>
          </div>

          {/* Description Block */}
          <div className="glass-card rounded-[2.5rem] p-8 lg:p-12 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
              <FileText className="w-6 h-6 text-primary" />
              Descrição do Produto
            </h2>
            <div className="text-gray-400 leading-relaxed whitespace-pre-wrap text-base">
              {product.description}
            </div>
          </div>
        </div>

        {/* Right Column / Sidebar */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6 shrink-0">
          
          {/* Purchase Card (Client Component) */}
          <ProductPurchaseCard product={product} subProducts={subProducts} />

          {/* Benefits Info Cards */}
          <div className="glass-card rounded-3xl p-6 flex items-start gap-5 border border-white/5 hover:border-blue-500/30 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">Entrega Imediata</h3>
              <p className="text-sm text-gray-500 leading-relaxed">O acesso ao produto é enviado automaticamente após a confirmação.</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 flex items-start gap-5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">Pagamento Seguro</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Transação criptografada e processada via PIX com total segurança.</p>
            </div>
          </div>
        </div>
      </div>


      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="pt-10 border-t border-white/5">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                Produtos Similares
              </h2>
              <p className="text-gray-500 mt-2 font-medium">Você também pode gostar desses itens da categoria {product.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
