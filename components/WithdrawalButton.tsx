'use client';

import { useState } from 'react';
import WithdrawalModal from '@/components/WithdrawalModal';
import { CreditCard } from 'lucide-react';

interface WithdrawalButtonProps {
  balance: number;
}

export default function WithdrawalButton({ balance }: WithdrawalButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-8 py-3 bg-white text-black rounded-2xl font-black uppercase italic text-xs hover:bg-gray-200 transition-all flex items-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
      >
        <CreditCard className="w-4 h-4" /> Sacar Comissões
      </button>
      {open && <WithdrawalModal balance={balance} onClose={() => setOpen(false)} />}
    </>
  );
}
