import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CheckoutClient from '@/components/CheckoutClient';

export default async function CheckoutPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return <CheckoutClient user={session.user} />;
}
