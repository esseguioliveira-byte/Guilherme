import { db } from '@/db';
import { products } from '@/db/schema';
import { like, or } from 'drizzle-orm';
import ProductCard from '@/components/ProductCard';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (await searchParams).q || '';

  const results = query
    ? await db
        .select()
        .from(products)
        .where(
          or(
            like(products.name, `%${query}%`),
            like(products.category, `%${query}%`),
            like(products.description, `%${query}%`)
          )
        )
    : [];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>
      </div>
      <div className="mb-10 border-b border-[#222] pb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {query ? (
                  <>Resultados para: <span className="text-primary">"{query}"</span></>
                ) : (
                  <>Buscar Produtos</>
                )}
              </h1>
              <p className="text-gray-500 text-sm">{results.length} produtos encontrados</p>
            </div>
          </div>
          
          <form action="/search" method="GET" className="flex-1 max-w-md w-full relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Digite o que procura..." 
              className="w-full bg-[#111] border border-[#333] rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-500 text-white shadow-inner"
            />
            <button type="submit" className="absolute inset-y-1 right-1 px-4 bg-primary hover:bg-blue-600 text-white text-xs font-bold rounded-full transition-all uppercase tracking-wider">
              Buscar
            </button>
          </form>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center mb-6 border border-[#222]">
            <Search className="w-10 h-10 text-gray-700" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Nenhum produto encontrado</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Não encontramos nada para "{query}". Tente usar palavras-chave mais genéricas ou verifique se digitou corretamente.
          </p>
          <Link href="/" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>
      )}
    </div>
  );
}
