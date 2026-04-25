import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CheckoutClient from '@/components/CheckoutClient';
import Navbar from '@/components/Navbar';

export default async function CheckoutPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <CheckoutClient user={session.user} />
    </div>
  );
}
