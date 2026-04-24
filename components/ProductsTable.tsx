'use client';

import { useState } from 'react';
import type { Product, WithdrawalRequest } from '@/db/schema'; // WithdrawalRequest is just to check imports
import { Edit2, Trash2, Plus, Package } from 'lucide-react';
import AdminProductModal from './AdminProductModal';
import { deleteProduct } from '@/app/actions/admin';

export default function ProductsTable({ 
  initialProducts, 
  categories 
}: { 
  initialProducts: Product[],
  categories: { id: string, name: string }[]
}) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleOpenNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setProductToEdit(p);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Produtos e Estoque</h1>
          <p className="text-gray-400 mt-1">Gerencie os produtos disponíveis na loja.</p>
        </div>
        <button onClick={handleOpenNew} className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[#222] bg-[#111]/50">
                <th className="p-4 text-sm font-medium text-gray-400">Produto</th>
                <th className="p-4 text-sm font-medium text-gray-400">Categoria</th>
                <th className="p-4 text-sm font-medium text-gray-400">Preço</th>
                <th className="p-4 text-sm font-medium text-gray-400">Estoque</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {initialProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum produto cadastrado.</td>
                </tr>
              ) : (
                initialProducts.map((p) => (
                  <tr key={p.id} className="border-b border-[#222] hover:bg-[#111] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#222] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-gray-500" />}
                        </div>
                        <span className="text-sm text-white font-medium">{p.name}</span>
                        {p.parentId && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase border border-blue-500/20">Sub</span>
                        )}
                      </div>

                    </td>
                    <td className="p-4 text-sm text-gray-400">{p.category}</td>
                    <td className="p-4 text-sm text-white font-medium">R$ {Number(p.price).toFixed(2).replace('.', ',')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${p.stock > 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {p.stock} unidades
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(p)} className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productToEdit={productToEdit} 
        categories={categories}
        allProducts={initialProducts}
      />


    </div>
  );
}
