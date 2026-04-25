import { Search, ShoppingCart, User, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { auth, signOut } from '@/auth';

import CartIcon from './CartIcon';
import SupportDropdown from './SupportDropdown';
import SearchBar from './SearchBar';
import UserDropdown from './UserDropdown';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function Navbar() {
  const session = await auth();
  
  let user = null;
  if (session?.user?.id) {
    try {
      user = await db.select().from(users).where(eq(users.id, session.user.id)).then(res => res[0]);
    } catch (e) {
      console.warn("Colunas de afiliado ausentes na Navbar. Rodar SQL de atualização.");
    }
  }

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#02040a]/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <img src="/content.png" alt="Bahia Store" className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
          <span 
            className="text-[10px] xs:text-sm sm:text-lg font-black tracking-[0.15em] bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent uppercase block"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            BAHIA STORE
          </span>
        </Link>


        <SearchBar />

        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/search" className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
            <Search className="w-4.5 h-4.5" strokeWidth={1.5} />
          </Link>
          
          <SupportDropdown />
          <CartIcon />
          
          {session?.user ? (
            <div className="flex items-center gap-3">
              <UserDropdown 
                userName={session.user.name || 'Usuário'} 
                userImage={user?.image || null}
                isAffiliate={user?.isAffiliate || false}
                isAdmin={(user as any)?.role === 'ADMIN'} 
              />
              <form action={handleSignOut} className="hidden xs:block">
                <button type="submit" className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors" title="Sair">
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 p-2 sm:px-5 sm:py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-lg sm:rounded-full transition-all text-xs font-black uppercase tracking-widest text-white italic">
              <User className="h-4.5 w-4.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
              <span className="hidden sm:block">Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
