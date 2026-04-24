'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { processPurchase } from '@/app/actions/checkout';
import { useRouter } from 'next/navigation';
import type { Product } from '@/db/schema';

const formSchema = z.object({
  quantity: z.number().min(1, 'Mínimo de 1 item').max(10, 'Máximo de 10 itens'),
});

type CheckoutFormData = z.infer<typeof formSchema>;

interface CheckoutModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ product, isOpen, onClose }: CheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const quantity = watch('quantity') || 1;
  const totalAmount = Number(product.price) * quantity;

  if (!isOpen) return null;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('productId', product.id);
    formData.append('quantity', data.quantity.toString());
    formData.append('price', product.price.toString()); // Mocado

    try {
      const response = await processPurchase(formData);
      
      if (response.success && response.orderId) {
        // Redirecionar para a página de detalhes do pedido
        router.push(`/orders/${response.orderId}?pixCode=${encodeURIComponent(response.pixCode || '')}`);
      } else {
        setError(response.error || 'Erro ao processar a compra.');
      }
    } catch (err) {
      setError('Erro inesperado de rede.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0A0A0A] border border-[#222] w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#111]/50">
          <h2 className="text-xl font-semibold text-white">Finalizar Compra</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex gap-4 mb-6 pb-6 border-b border-[#222]">
            <div className="w-20 h-20 bg-[#111] rounded-lg overflow-hidden border border-[#222] shrink-0">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">Sem Foto</div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-white mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-gray-400">{product.category}</p>
              <div className="text-primary font-semibold mt-2">R$ {Number(product.price).toFixed(2).replace('.', ',')}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quantidade</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  className="w-24 bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  min="1"
                  max="10"
                />
                <span className="text-gray-400 text-sm">itens</span>
              </div>
              {errors.quantity && <p className="text-red-400 text-sm mt-1">{errors.quantity.message}</p>}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="bg-[#111] rounded-xl p-4 border border-[#222]">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Subtotal ({quantity}x)</span>
                <span>R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-white pt-2 border-t border-[#333] mt-2">
                <span>Total a pagar via PIX</span>
                <span>R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Gerar PIX e Finalizar
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
