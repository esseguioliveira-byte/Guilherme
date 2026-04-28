'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  CreditCard, 
  TrendingUp, 
  Home, 
  ShoppingBag, 
  Tag, 
  Banknote, 
  ListTree,
  Menu,
  X 
} from 'lucide-react';

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Visão Geral', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Pedidos', href: '/admin/orders', icon: CreditCard },
    { name: 'Estoque', href: '/admin/stock', icon: Package },
    { name: 'Produtos', href: '/admin/products', icon: ShoppingBag },
    { name: 'Clientes', href: '/admin/customers', icon: Users },
    { name: 'Afiliados', href: '/admin/affiliates', icon: TrendingUp },
    { name: 'Saques', href: '/admin/withdrawals', icon: Banknote },
    { name: 'Categorias', href: '/admin/categories', icon: ListTree },
    { name: 'Cupons', href: '/admin/coupons', icon: Tag },
    { name: 'Pagamentos', href: '/admin/payments', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#222] bg-[#0A0A0A] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <span className="text-primary font-bold">{user.name?.[0] || 'A'}</span>
          </div>
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Painel Admin
          </h2>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-gray-400 hover:text-white bg-[#111] rounded-lg border border-[#222] transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-[#222] flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="p-6 border-b border-[#222] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider hidden md:block" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Painel Admin
            </h2>
            <div className="mt-0 md:mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                <span className="text-primary font-bold">{user.name?.[0] || 'A'}</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-white font-medium truncate text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-white bg-[#111] rounded-lg border border-[#222]">
            <X className="w-5 h-5" />
          </button>
        </div>
      
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact 
            ? pathname === link.href 
            : pathname.startsWith(link.href);

          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-[#111] border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-gray-500'}`} />
              {link.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#222] space-y-1.5">
        <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 w-full rounded-xl transition-colors hover:bg-[#111]">
          <Home className="w-5 h-5 text-gray-500" />
          Voltar para o Site
        </Link>
        <button className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 w-full rounded-xl transition-colors hover:bg-[#111]">
          <Settings className="w-5 h-5 text-gray-500" />
          Configurações
        </button>
      </div>
    </aside>
    </>
  );
}
