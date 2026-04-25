'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check, Plus, Circle, CheckCircle2, ArrowRight, Store, Zap, X } from 'lucide-react';
import type { Product } from '@/db/schema';
import { useCart } from '@/contexts/CartContext';

interface ProductPurchaseCardProps {
  product: Product;
  subProducts?: Product[];
}

export default function ProductPurchaseCard({ product, subProducts = [] }: ProductPurchaseCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  
  const options = [product, ...subProducts];
  const [selectedProduct, setSelectedProduct] = useState<Product>(product);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  
  const handleAddToCart = () => {
    if (!isAdded) {
      addToCart(selectedProduct, 1, false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
      // Opcional: manter o showConfirm se quiser o modal também, 
      // mas o usuário pediu animação no botão.
    }
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, 1, false);
    router.push('/checkout');
  };

  const handleGoToCheckout = () => {
    setShowConfirm(false);
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    setShowConfirm(false);
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#222] rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
      
      {/* ✅ Added-to-cart confirmation overlay */}
      {showConfirm && (
        <div className="absolute inset-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center gap-6 p-8 animate-in fade-in duration-300">
          <button
            onClick={() => setShowConfirm(false)}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="text-center">
            <p className="text-lg font-black text-white mb-1">Adicionado ao carrinho!</p>
            <p className="text-sm text-gray-500 font-medium line-clamp-1">{selectedProduct.name}</p>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={handleGoToCheckout}
              className="w-full bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <Zap className="w-4 h-4" />
              Ir para Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleContinueShopping}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <Store className="w-4 h-4 text-gray-400" />
              Continuar Comprando
            </button>
          </div>
        </div>
      )}

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

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button 
          onClick={handleBuyNow}
          disabled={selectedProduct.stock <= 0}
          className="flex-[4] bg-primary hover:bg-blue-600 disabled:bg-[#222] disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:shadow-none flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
        >
          <Zap className="w-4 h-4" />
          Comprar Agora
        </button>
        
        <button 
          onClick={handleAddToCart}
          disabled={selectedProduct.stock <= 0}
          className={`flex-1 py-5 flex items-center justify-center rounded-2xl transition-all duration-500 border ${
            selectedProduct.stock > 0 
            ? isAdded 
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105' 
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-primary/50' 
            : 'bg-[#111] text-gray-700 cursor-not-allowed border border-white/5'
          }`}
        >
          {isAdded ? (
            <Check className="w-6 h-6 animate-in zoom-in duration-300" strokeWidth={3} />
          ) : (
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </div>
  );
}
