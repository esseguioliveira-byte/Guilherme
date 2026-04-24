'use client';

import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { processCartPurchase } from '@/app/actions/cart-checkout';

export default function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCart} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#0A0A0A] border-l border-[#222] h-full flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#111]/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Seu Carrinho ({totalItems})
          </h2>
          <button onClick={closeCart} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-1">Seu carrinho está vazio</p>
                <p className="text-sm text-gray-500">Navegue pela loja e adicione produtos.</p>
              </div>
              <button onClick={closeCart} className="px-6 py-2 bg-[#111] hover:bg-[#222] border border-[#333] rounded-full text-white text-sm transition-colors mt-4">
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-[#111] rounded-xl overflow-hidden shrink-0 border border-[#222]">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-600 h-full flex items-center justify-center">Sem foto</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-sm font-medium text-white line-clamp-1">{item.product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.product.category}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 bg-[#111] border border-[#333] rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 text-gray-400 hover:text-white transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 text-gray-400 hover:text-white transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">R$ {Number(item.product.price).toFixed(2).replace('.', ',')}</span>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#222] bg-[#0A0A0A] space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-[#222]">
                <span>Total PIX</span>
                <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                closeCart();
                router.push('/checkout');
              }}
              className="w-full py-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
