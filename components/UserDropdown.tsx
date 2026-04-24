'use client';

import { useState, useRef, useEffect } from 'react';
import { Package, User, LayoutDashboard, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface UserDropdownProps {
  userName: string;
  isAffiliate: boolean;
  isAdmin: boolean;
}

export default function UserDropdown({ userName, isAffiliate, isAdmin }: UserDropdownProps) {

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-4 bg-white/5 backdrop-blur-md hover:bg-white/10 rounded-full transition-all border border-white/10 hover:border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
      >
        <div className="w-8 h-8 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]">
          <User className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-medium hidden sm:block text-gray-200">
          {userName.split(' ')[0] || 'Perfil'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#0A0A0A] border border-[#222] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="p-3 border-b border-[#222] bg-[#111]/50">
            <p className="text-sm font-medium text-white">{userName}</p>
          </div>
          <div className="p-2 space-y-1">
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#1a1a1a] rounded-xl transition-colors"
            >
              <Package className="w-4 h-4" />
              Meus Pedidos
            </Link>
            {isAffiliate && (
              <Link 
                href="/affiliates/dashboard" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-xl transition-colors font-bold"
              >
                <DollarSign className="w-4 h-4" />
                Painel Afiliado
              </Link>
            )}
            {isAdmin && (
              <Link 
                href="/admin" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#1a1a1a] rounded-xl transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Painel Admin
              </Link>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
