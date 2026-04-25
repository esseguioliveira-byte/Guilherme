'use client';

import { useState } from 'react';
import { Zap, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/db/schema';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

import Link from 'next/link';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1, false);
      router.push('/checkout');
    }
  };

  return (
    <div className={`glass-card group relative rounded-[2.5rem] overflow-hidden flex flex-col h-full border border-white/5 transition-all duration-500 ${product.stock > 0 ? 'hover:border-primary/40 shadow-[0_0_40px_rgba(0,0,0,0.3)]' : 'opacity-90'}`}>
      <Link href={`/product/${product.id}`} className="aspect-[16/9] w-full relative overflow-hidden block">
        <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
          {product.imageUrl ? (
             <img 
                src={product.imageUrl} 
                alt={product.name} 
                className={`object-cover w-full h-full transition-transform duration-700 ${product.stock > 0 ? 'group-hover:scale-110' : 'grayscale-[80%] opacity-50 mix-blend-luminosity'}`} 
             />
          ) : (
            <span className="text-sm font-medium text-gray-700">Sem Imagem</span>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-80" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] px-3 py-1 rounded-full text-primary font-black uppercase tracking-widest nasa-title">
            {product.category}
          </span>
        </div>

        {/* Esgotado Image Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full shadow-xl">
              <span className="text-white/90 text-[11px] font-bold tracking-[0.3em] uppercase">Esgotado</span>
            </div>
          </div>
        )}
      </Link>

      <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-transparent to-[#05050a]/80">
        <Link href={`/product/${product.id}`} className="flex-1 mb-4">
          <h3 className={`text-xl font-black transition-colors line-clamp-2 leading-tight tracking-tight uppercase italic ${product.stock > 0 ? 'group-hover:text-primary text-white' : 'text-gray-400'}`} style={{ fontFamily: 'var(--font-jakarta)' }}>
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${product.stock > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
              {product.stock > 0 ? 'Disponível' : 'Sem Estoque'}
            </span>
          </div>
        </Link>
        
        <div className="space-y-4">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Por</span>
              <span className={`text-3xl font-black italic tracking-tighter ${product.stock > 0 ? 'text-white' : 'text-gray-500'}`}>
                R$ {Number(product.price).toFixed(2).replace('.', ',')}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-bold tracking-widest uppercase ml-7">
              À vista no Pix
            </span>
          </div>
          
          <button 
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className={`w-full py-4 flex items-center justify-center gap-3 rounded-2xl transition-all duration-300 font-black uppercase italic tracking-widest text-xs ${
              product.stock > 0 
              ? 'btn-stardust text-white cursor-pointer shadow-[0_10px_25px_rgba(59,130,246,0.2)] hover:shadow-[0_15px_35px_rgba(59,130,246,0.4)] hover:-translate-y-1' 
              : 'bg-[#111] text-gray-700 cursor-not-allowed border border-white/5'
            }`}
          >
            <Zap className="w-4 h-4" />
            Comprar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
