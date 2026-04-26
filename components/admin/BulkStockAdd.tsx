'use client';

import { useState } from 'react';
import { addStockItems } from '@/app/actions/admin';
import { Loader2, Plus, X, CheckCircle } from 'lucide-react';

export default function BulkStockAdd({ products }: { products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [content, setContent] = useState('');
  const [stockType, setStockType] = useState<'private' | 'shared'>('private');
  const [maxSlots, setMaxSlots] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !content) return;
    
    setLoading(true);
    try {
      const finalSlots = stockType === 'private' ? 5 : maxSlots;
      const res = await addStockItems(productId, content, finalSlots);
      if (res.success) {
        setContent('');
        setMaxSlots(5);
        setStockType('private');
        setIsOpen(false);
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert('Erro ao adicionar itens');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-primary hover:bg-blue-600 rounded-xl font-bold text-sm transition-all flex items-center gap-2 text-white shadow-lg shadow-primary/20"
      >
        <Plus className="w-4 h-4" /> Adicionar Estoque em Massa
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-[#222] w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-6 border-b border-[#222] flex items-center justify-between">
          <h3 className="font-bold text-white uppercase italic">Adicionar Itens ao Estoque</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Selecionar Produto</label>
            <select 
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-white outline-none focus:border-primary transition-all appearance-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Tipo de Entrega</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setStockType('private')}
                className={`p-4 rounded-xl border font-bold text-xs transition-all ${
                  stockType === 'private' 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-[#111] border-[#222] text-gray-500 hover:border-gray-700'
                }`}
              >
                Privado (Até 5 Pessoas)
              </button>
              <button
                type="button"
                onClick={() => setStockType('shared')}
                className={`p-4 rounded-xl border font-bold text-xs transition-all ${
                  stockType === 'shared' 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : 'bg-[#111] border-[#222] text-gray-500 hover:border-gray-700'
                }`}
              >
                Compartilhado (Customizado)
              </button>
            </div>
          </div>

          {stockType === 'shared' && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Quantidade de Pessoas (Slots)</label>
              <input 
                type="number"
                min={1}
                value={maxSlots}
                onChange={(e) => setMaxSlots(parseInt(e.target.value))}
                className="w-full bg-[#111] border border-emerald-500/30 rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition-all"
              />
              <p className="text-[9px] text-emerald-500/60 mt-2 italic font-medium uppercase tracking-wider">
                * Este item será vendido para {maxSlots} clientes diferentes antes de esgotar.
              </p>
            </div>
          )}
          
          {stockType === 'private' && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl animate-in fade-in duration-300">
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle className="w-3 h-3" /> Configuração Privada: 5 Vendas por Item
              </p>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Conteúdo (Uma linha por item)</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ex:
CODIGO-1
CODIGO-2
LINK-ENTREGA-3"
              rows={8}
              className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-white font-mono text-xs outline-none focus:border-primary transition-all resize-none"
            />
            <p className="text-[10px] text-gray-600 mt-2 italic">* Cada linha será salva como um item individual para entrega.</p>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-blue-600 disabled:opacity-50 rounded-xl font-black uppercase italic transition-all flex items-center justify-center gap-2 text-white"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Adição'}
          </button>
        </form>
      </div>
    </div>
  );
}
