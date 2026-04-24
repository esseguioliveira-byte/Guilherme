import { db } from '@/db';
import { categories } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { createCategory } from '@/app/actions/categories';
import CategoryRow from '@/components/admin/CategoryRow';

export default async function AdminCategories() {
  const categoryList = await db.select().from(categories).orderBy(desc(categories.createdAt));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight nasa-title">Categorias</h1>
        <p className="text-gray-500 mt-1">Gerencie as categorias de produtos da loja.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111]/50 text-[10px] uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-4 font-black">Nome</th>
                  <th className="px-6 py-4 font-black">Slug</th>
                  <th className="px-6 py-4 font-black text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {categoryList.map((cat) => (
                  <CategoryRow key={cat.id} category={cat} />
                ))}
                {categoryList.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-gray-600 italic text-sm">
                      Nenhuma categoria cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-[32px] p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Nova Categoria
            </h3>
            <form action={async (formData) => {
              'use server';
              await createCategory(formData);
            }} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block">Nome da Categoria</label>
                <input 
                  name="name"
                  type="text" 
                  placeholder="Ex: Streaming, VPN..."
                  className="w-full px-4 py-3 bg-[#111] border border-[#222] focus:border-primary/50 rounded-2xl text-white text-sm outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest transition-all shadow-lg shadow-primary/20"
              >
                Criar Categoria
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
