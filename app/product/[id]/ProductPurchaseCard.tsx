'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check, Plus, Circle, CheckCircle2 } from 'lucide-react';
import type { Product } from '@/db/schema';
import { useCart } from '@/contexts/CartContext';

interface ProductPurchaseCardProps {
  product: Product;
  subProducts?: Product[];
}

export default function ProductPurchaseCard({ product, subProducts = [] }: ProductPurchaseCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  
  // All available options: the main product + any sub-products
  const options = [product, ...subProducts];
  const [selectedProduct, setSelectedProduct] = useState<Product>(product);

  const handleBuyNow = () => {
    addToCart(selectedProduct, 1, false); // Add without opening drawer
    router.push('/checkout');
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#222] rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      <h1 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight flex items-center gap-2" style={{ fontFamily: 'var(--font-jakarta)' }}>
        {selectedProduct.name}
      </h1>

      <div className="flex items-center gap-2 mb-6">
        <span className={`px-2 py-1 rounded-md text-xs font-bold ${selectedProduct.stock > 0 ? 'bg-primary/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
          {selectedProduct.stock > 0 ? `${selectedProduct.stock} em estoque` : 'ESGOTADO'}
        </span>
      </div>

      <div className="mb-6">
        <div className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-jakarta)' }}>
          R$ {Number(selectedProduct.price).toFixed(2).replace('.', ',')}
        </div>
        <div className="text-sm text-green-400 flex items-center gap-1">
          <Check className="w-4 h-4" /> À vista no Pix
        </div>
      </div>

      {/* Variation Selection Options */}
      {options.length > 1 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Escolha o Plano</h3>
          {options.map((opt) => {
            const isSelected = selectedProduct.id === opt.id;
            return (
              <div 
                key={opt.id}
                onClick={() => setSelectedProduct(opt)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500 shrink-0" />
                  )}
                  <div>
                    <div className={`font-bold line-clamp-1 ${isSelected ? 'text-white' : 'text-gray-300'}`} style={{ fontFamily: 'var(--font-jakarta)' }}>
                      {opt.name}
                    </div>
                    {opt.stock > 0 ? (
                      <div className="text-xs text-blue-400 font-medium">{opt.stock} em estoque</div>
                    ) : (
                      <div className="text-xs text-red-500 font-medium">Esgotado</div>
                    )}
                  </div>
                </div>
                <div className={`font-bold shrink-0 ml-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} style={{ fontFamily: 'var(--font-jakarta)' }}>
                  R$ {Number(opt.price).toFixed(2).replace('.', ',')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add to Cart Buttons */}
      <div className="space-y-3 pt-2">
        <button 
          onClick={handleBuyNow}
          disabled={selectedProduct.stock <= 0}
          className="w-full bg-primary hover:bg-blue-600 disabled:bg-[#222] disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:shadow-none flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Comprar Agora
        </button>
        
        <button 
          onClick={() => addToCart(selectedProduct, 1)}
          disabled={selectedProduct.stock <= 0}
          className="w-full bg-[#111] hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed text-white border border-[#333] hover:border-[#444] font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
           <Plus className="w-4 h-4" />
           Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}
