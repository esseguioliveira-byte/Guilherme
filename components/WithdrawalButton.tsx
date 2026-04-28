import Link from 'next/link';
import { CreditCard } from 'lucide-react';

export default function WithdrawalButton() {
  return (
    <Link
      href="/affiliates/withdraw"
      className="px-8 py-3 bg-white text-black rounded-2xl font-black uppercase italic text-xs hover:bg-gray-200 transition-all flex items-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
    >
      <CreditCard className="w-4 h-4" /> Sacar Comissões
    </Link>
  );
}
