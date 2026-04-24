'use client';

import { useState } from 'react';
import { addStockItems } from '@/app/actions/admin';
import { Loader2, Plus, X } from 'lucide-react';

export default function BulkStockAdd({ products }: { products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !content) return;
    
    setLoading(true);
    try {
      const res = await addStockItems(productId, content);
      if (res.success) {
        setContent('');
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
