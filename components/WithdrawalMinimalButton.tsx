'use client';

import { useState } from 'react';
import WithdrawalModal from '@/components/WithdrawalModal';
import { ArrowUpRight } from 'lucide-react';

interface WithdrawalMinimalButtonProps {
  balance: number;
}

export default function WithdrawalMinimalButton({ balance }: WithdrawalMinimalButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:text-emerald-400 transition-colors active:scale-95"
      >
        Solicitar Saque <ArrowUpRight className="w-3 h-3" />
      </button>
      {open && <WithdrawalModal balance={balance} onClose={() => setOpen(false)} />}
    </>
  );
}
