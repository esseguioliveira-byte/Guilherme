'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartIcon() {
  const { totalItems, openCart } = useCart();

  return (
    <button onClick={openCart} className="relative p-2 hover:bg-[#111] rounded-full transition-colors">
      <ShoppingCart className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
      {totalItems > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
          {totalItems}
        </span>
      )}
    </button>
  );
}
