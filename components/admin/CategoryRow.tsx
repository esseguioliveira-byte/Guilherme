'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, X, Check } from 'lucide-react';
import { deleteCategory, updateCategory } from '@/app/actions/categories';

export default function CategoryRow({ category }: { category: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState(category.name);

  // Sync state if category changes from outside (e.g. after save)
  useEffect(() => {
    setName(category.name);
  }, [category.name]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    const res = await updateCategory(category.id, formData);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error);
    }
  }

  return (
    <tr className="hover:bg-[#111]/30 transition-all group">
      <td className="px-6 py-4">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="flex items-center gap-2 w-full max-w-sm">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#111] border border-[#333] text-white px-3 py-1.5 rounded-lg text-sm w-full outline-none focus:border-primary shadow-inner"
              autoFocus
            />
            <button type="submit" disabled={!name || name === category.name} className="p-1.5 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 disabled:opacity-50 disabled:hover:bg-emerald-400/10 rounded-lg transition-all">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => { setIsEditing(false); setName(category.name); }} type="button" className="p-1.5 text-gray-400 bg-[#222] hover:bg-[#333] rounded-lg transition-all">
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <p className="text-sm font-bold text-white">{category.name}</p>
        )}
      </td>
      <td className="px-6 py-4 text-xs font-mono text-gray-500">
        {!isEditing && category.slug}
      </td>
      <td className="px-6 py-4 text-right">
        {!isEditing && (
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(true)} type="button" className="p-2 text-gray-600 hover:text-white hover:bg-[#222] rounded-xl transition-all">
              <Edit2 className="w-4 h-4" />
            </button>
            <form action={async () => {
              setIsDeleting(true);
              if (confirm('Deletar esta categoria? Produtos associados ficarão sem categoria.')) {
                await deleteCategory(category.id);
              }
              setIsDeleting(false);
            }}>
              <button disabled={isDeleting} type="submit" className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all disabled:opacity-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </td>
    </tr>
  );
}
