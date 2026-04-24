'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchProducts } from '@/app/actions/search';
import type { Product } from '@/db/schema';
import Link from 'next/link';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const data = await searchProducts(query);
        setResults(data);
        setIsLoading(false);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="w-full relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : (
            <Search className={`h-4 w-4 transition-colors ${query ? 'text-primary' : 'text-gray-500 group-focus-within:text-primary'}`} />
          )}
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder="Buscar produtos..." 
          className="w-full bg-[#111] border border-[#222] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-500 text-white shadow-inner"
        />
      </form>

      {/* Real-time Results Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-[#0A0A0A] border border-[#222] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {results.length > 0 ? (
              <>
                <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#111] mb-1">
                  Produtos Encontrados
                </div>
                {results.map((product) => (
                  <Link 
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 p-2 hover:bg-[#111] rounded-xl transition-all group"
                  >
                    <div className="w-10 h-10 bg-[#050505] rounded-lg overflow-hidden border border-[#222] group-hover:border-primary/30 shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{product.name}</p>
                      <p className="text-xs text-primary font-medium">R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-primary group-hover:translate-x-1 transition-all mr-2" />
                  </Link>
                ))}
                <button 
                  onClick={handleSearch}
                  className="w-full mt-1 p-3 text-xs font-bold text-gray-400 hover:text-white hover:bg-[#111] transition-all flex items-center justify-center gap-2 border-t border-[#111]"
                >
                  Ver todos os resultados
                </button>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">Nenhum resultado para "{query}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
