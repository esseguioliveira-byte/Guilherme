import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { User, Package, DollarSign, Settings } from 'lucide-react';
import Link from 'next/link';
import SpaceBackground from '@/components/SpaceBackground';
import Navbar from '@/components/Navbar';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).then(res => res[0]);
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-[#02040a] pb-20 px-4 relative overflow-hidden">
      <Navbar />
      <div className="pt-32">
        <SpaceBackground />
        
        <div className="max-w-6xl mx-auto relative z-10">

        {/* Header Profile Section */}
        <div className="glass-card rounded-[2.5rem] p-10 mb-8 border border-white/5 relative overflow-hidden">
           {/* Decorative Glow */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
           
           <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                 <span className="text-primary font-black text-4xl italic">{user.name?.[0] || 'U'}</span>
              </div>
              <div className="text-center md:text-left flex-1">
                 <h1 className="text-3xl font-black uppercase italic tracking-tight text-white mb-1">
                    {user.name}
                 </h1>
                 <p className="text-gray-500 font-medium">{user.email}</p>
                 <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400">
                       ID: {user.id.slice(0, 8)}
                    </span>
                    {user.isAffiliate && (
                       <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                          <DollarSign className="w-3 h-3" /> Afiliado Ativo
                       </span>
                    )}
                 </div>
              </div>
              <div className="flex gap-3">
                 <Link href="/profile/settings" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
                    <Settings className="w-5 h-5 text-gray-400" />
                 </Link>
              </div>
           </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
           <Link 
              href="/profile" 
              className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold uppercase italic tracking-wider transition-all whitespace-nowrap"
           >
              <Package className="w-5 h-5 text-primary" />
              Meus Pedidos
           </Link>
           <Link 
              href="/profile/affiliate" 
              className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold uppercase italic tracking-wider transition-all whitespace-nowrap"
           >
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Painel de Afiliado
           </Link>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           {children}
        </div>
        </div>
      </div>
    </div>
  );
}


