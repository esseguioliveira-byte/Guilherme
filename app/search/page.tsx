import { db } from '@/db';
import { products } from '@/db/schema';
import { like, or } from 'drizzle-orm';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';

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
      <div className="flex items-center gap-3 mb-10 border-b border-[#222] pb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
          <Search className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Resultados para: <span className="text-primary">"{query}"</span>
          </h1>
          <p className="text-gray-500 text-sm">{results.length} produtos encontrados</p>
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
          <p className="text-gray-500 max-w-md mx-auto">
            Não encontramos nada para "{query}". Tente usar palavras-chave mais genéricas ou verifique se digitou corretamente.
          </p>
        </div>
      )}
    </div>
  );
}
