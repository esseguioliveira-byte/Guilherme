'use client';

import { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { createProduct, updateProduct } from '@/app/actions/admin';
import type { Product } from '@/db/schema';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  categories: { id: string, name: string }[];
  allProducts: Product[];
}

export default function AdminProductModal({ isOpen, onClose, productToEdit, categories, allProducts }: AdminProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(productToEdit?.categoryId || '');
  const [selectedParentId, setSelectedParentId] = useState(productToEdit?.parentId || '');

  if (!isOpen) return null;



  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    
    try {
      let res;
      if (productToEdit) {
        res = await updateProduct(productToEdit.id, formData);
      } else {
        res = await createProduct(formData);
      }

      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Erro ao salvar produto');
      }
    } catch (err: any) {
      setError('Erro de rede ao salvar produto');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0A0A0A] border border-[#222] w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#111]/50">
          <h2 className="text-xl font-semibold text-white">
            {productToEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
            <input name="name" required defaultValue={productToEdit?.name || ''} className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-white outline-none focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
            <textarea name="description" required defaultValue={productToEdit?.description || ''} className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-white outline-none focus:border-primary h-20" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Preço (R$)</label>
              <input name="price" type="number" step="0.01" required defaultValue={productToEdit?.price ? Number(productToEdit.price) : ''} className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-white outline-none focus:border-primary" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Estoque</label>
              <input name="stock" type="number" required defaultValue={productToEdit?.stock ?? 1} className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-white outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
            <select 
              name="categoryId" 
              required 
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-white outline-none focus:border-primary appearance-none"
            >
              <option value="" disabled>Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {/* Hidden field for categoryName (legacy support) */}
            <input 
              type="hidden" 
              name="categoryName" 
              value={categories.find(c => c.id === selectedCategoryId)?.name || ''} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Produto Pai (Opcional)</label>
            <select 
              name="parentId" 
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-white outline-none focus:border-primary appearance-none"
            >
              <option value="">Nenhum (Este é um produto principal)</option>
              {allProducts
                .filter(p => p.id !== productToEdit?.id && !p.parentId) // Only main products can be parents
                .map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-1 italic">Use para agrupar planos ou variações sob um produto principal.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">URL da Imagem</label>
            <input name="imageUrl" defaultValue={productToEdit?.imageUrl || ''} placeholder="https://..." className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-white outline-none focus:border-primary" />
          </div>


          <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-70">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {productToEdit ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </form>
      </div>
    </div>
  );
}
