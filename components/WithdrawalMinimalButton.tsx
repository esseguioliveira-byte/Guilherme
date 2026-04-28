import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function WithdrawalMinimalButton() {
  return (
    <Link
      href="/affiliates/withdraw"
      className="mt-4 flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:text-emerald-400 transition-colors active:scale-95"
    >
      Solicitar Saque <ArrowUpRight className="w-3 h-3" />
    </Link>
  );
}
