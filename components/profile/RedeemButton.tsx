'use client';

import { useState } from 'react';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface RedeemButtonProps {
  children: React.ReactNode;
}

export default function RedeemButton({ children }: RedeemButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-lg sm:rounded-xl transition-all border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-auto ${
          isOpen 
            ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
            : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border-emerald-500/20'
        }`}
      >
        <Zap className={`w-3 h-3 ${isOpen ? 'animate-pulse' : ''}`} />
        {isOpen ? 'Ocultar' : 'Resgatar'}
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}
