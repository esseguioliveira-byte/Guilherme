import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import WithdrawalForm from '@/components/WithdrawalForm';

export default async function WithdrawPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await db.select().from(users).where(eq(users.id, session.user.id)).then(res => res[0]);
  
  if (!user || !user.isAffiliate) {
    redirect('/affiliates');
  }

  const balance = Number(user.balance || 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="mb-12 text-center">
           <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
              Resgate de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Comissões</span>
           </h1>
           <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
              Retire seus lucros de forma rápida e segura via PIX. O prazo de processamento é de até 48 horas úteis.
           </p>
        </header>

        <WithdrawalForm balance={balance} />
      </div>
    </div>
  );
}
