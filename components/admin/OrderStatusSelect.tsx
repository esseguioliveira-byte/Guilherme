'use client';

import { updateOrderStatus } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
}

export default function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (newStatus: any) => {
    setLoading(true);
    setStatus(newStatus);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
        setStatus(currentStatus); // Revert
      }
    } catch (error) {
      alert('Erro ao atualizar status');
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (s: string) => {
    switch (s) {
      case 'PAID':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'CANCELLED':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    }
  };

  return (
    <div className="relative inline-block">
      <select 
        value={status}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value)}
        className={`appearance-none px-4 py-2 rounded-xl border ${getStatusStyles(status)} text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-opacity-20 transition-all pr-8 disabled:opacity-50`}
      >
        <option value="PENDING" className="bg-[#0A0A0A] text-amber-400">Pendente</option>
        <option value="PAID" className="bg-[#0A0A0A] text-emerald-400">Pago</option>
        <option value="CANCELLED" className="bg-[#0A0A0A] text-red-400">Cancelado</option>
      </select>
      {loading && (
        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-white/50" />
      )}
    </div>
  );
}
