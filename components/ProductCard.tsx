'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/db/schema';
import CheckoutModal from './CheckoutModal';

import Link from 'next/link';

export default function ProductCard({ product }: { product: Product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <div className={`glass-card group relative rounded-[2rem] overflow-hidden flex flex-col h-full border border-white/5 transition-all duration-500 ${product.stock > 0 ? 'hover:border-primary/40' : 'opacity-90'}`}>
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

        {/* Esgotado Image Overlay - Minimalist/Discreet */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full shadow-xl">
              <span 
                className="text-white/90 text-[11px] font-bold tracking-[0.3em] uppercase"
                style={{ fontFamily: 'var(--font-space)' }}
              >
                Esgotado
              </span>
            </div>
          </div>
        )}
      </Link>

      
      <div className="p-5 flex flex-col flex-grow relative bg-gradient-to-b from-transparent to-[#05050a]/80">
        <Link href={`/product/${product.id}`} className="flex-1 mb-4">
          <h3
            style={{ fontFamily: 'var(--font-jakarta)' }}
            className={`text-lg font-black transition-colors line-clamp-2 leading-tight tracking-tight ${product.stock > 0 ? 'group-hover:text-primary text-white' : 'text-gray-400'}`}
          >
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.03]">
          <div className="flex flex-col">
            {product.stock > 0 ? (
               <div className="flex items-center gap-1.5 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                 <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Disponível</span>
               </div>
            ) : (
               <div className="flex items-center gap-1.5 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                 <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Sem Estoque</span>
               </div>
            )}
            
            <div className="flex flex-col mt-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Por</span>
                <span className={`text-2xl font-black italic tracking-tighter ${product.stock > 0 ? 'text-white' : 'text-gray-500'}`}>
                  R$ {Number(product.price).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <span className="text-[9px] text-emerald-400/80 font-bold tracking-wider uppercase ml-6">
                À vista no Pix
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={product.stock <= 0}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
              product.stock > 0 
              ? 'btn-stardust text-white cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
              : 'bg-[#111] text-gray-700 cursor-not-allowed border border-white/5'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

      <CheckoutModal 
        product={product} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
