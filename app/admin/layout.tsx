import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Package, Users, Settings, CreditCard, TrendingUp, Home, ShoppingBag, Tag, Banknote, ListTree } from 'lucide-react';



import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <AdminSidebar user={{ name: session.user.name, email: session.user.email }} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>

  );
}
