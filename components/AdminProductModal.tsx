'use client';

import { useState } from 'react';
import { X, Loader2, Save, Upload, ImageIcon, Link } from 'lucide-react';
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
  const [imageUrl, setImageUrl] = useState(productToEdit?.imageUrl || '');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Erro ao fazer upload');
      } else {
        setImageUrl(data.url);
      }
    } catch {
      setUploadError('Erro de rede ao fazer upload');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    // Ensure imageUrl uses the current state value (either typed URL or uploaded URL)
    formData.set('imageUrl', imageUrl);

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
      <div className="bg-[#0A0A0A] border border-[#222] w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#111]/50 sticky top-0 z-10">
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Preço (R$)</label>
            <input name="price" type="number" step="0.01" required defaultValue={productToEdit?.price ? Number(productToEdit.price) : ''} className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-white outline-none focus:border-primary" />
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
                .filter(p => p.id !== productToEdit?.id && !p.parentId)
                .map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-1 italic">Use para agrupar planos ou variações sob um produto principal.</p>
          </div>

          {/* Image Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Imagem do Produto</label>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  imageMode === 'upload'
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Local
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  imageMode === 'url'
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                URL Externa
              </button>
            </div>

            {/* Upload Mode */}
            {imageMode === 'upload' && (
              <div>
                <label
                  htmlFor="image-upload-input"
                  className={`flex flex-col items-center justify-center gap-3 w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isUploading
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-[#333] bg-[#111] hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <span className="text-xs text-primary font-medium">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-500" />
                      <span className="text-xs text-gray-500 text-center">
                        Clique para selecionar<br />
                        <span className="text-[10px]">JPG, PNG, WEBP, GIF — máx. 5MB</span>
                      </span>
                    </>
                  )}
                </label>
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadError && (
                  <p className="text-xs text-red-400 mt-1">{uploadError}</p>
                )}
              </div>
            )}

            {/* URL Mode */}
            {imageMode === 'url' && (
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-white outline-none focus:border-primary text-sm"
              />
            )}

            {/* Hidden field that always holds the current imageUrl value */}
            <input type="hidden" name="imageUrl" value={imageUrl} />

            {/* Preview */}
            {imageUrl && (
              <div className="mt-3 relative group">
                <div className="w-full h-32 rounded-xl overflow-hidden border border-[#333] bg-[#111]">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-[10px] text-gray-500 mt-1 truncate">{imageUrl}</p>
              </div>
            )}

            {!imageUrl && (
              <div className="mt-3 flex items-center justify-center w-full h-20 rounded-xl border border-[#222] bg-[#0d0d0d]">
                <div className="flex flex-col items-center gap-1 text-gray-700">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-[10px]">Sem imagem</span>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting || isUploading} className="w-full mt-4 py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-70">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {productToEdit ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </form>
      </div>
    </div>
  );
}
