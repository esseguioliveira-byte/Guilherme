'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartIcon() {
  const { totalItems, openCart } = useCart();
  const [showPlusOne, setShowPlusOne] = useState(false);
  const prevTotalItems = useRef(totalItems);

  useEffect(() => {
    if (totalItems > prevTotalItems.current) {
      setShowPlusOne(false); // Reset if already showing
      setTimeout(() => setShowPlusOne(true), 10);
      const timer = setTimeout(() => setShowPlusOne(false), 1000);
      return () => clearTimeout(timer);
    }
    prevTotalItems.current = totalItems;
  }, [totalItems]);

  return (
    <button onClick={openCart} className="relative p-2 hover:bg-white/5 rounded-full transition-all group active:scale-95">
      <ShoppingCart className="h-5.5 w-5.5 text-gray-400 group-hover:text-white transition-colors" />
      {totalItems > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-black flex items-center justify-center rounded-full border border-[#02040a]">
          {totalItems}
        </span>
      )}
      
      {showPlusOne && (
        <span className="absolute -top-4 right-0 text-emerald-400 font-black text-xs pointer-events-none animate-in slide-in-from-bottom-2 fade-in fade-out-60 zoom-in duration-700">
          +1
        </span>
      )}
    </button>
  );
}
