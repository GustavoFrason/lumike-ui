'use client';

import { useState } from 'react';
import { Category } from '@/lib/services/categories.service';
import { ImageUpload } from '@/components/ui/image-upload';

interface ModalProps {
  categoria: Category | null;
  onClose: () => void;
  onSave: (categoria: Partial<Category> & { pendingFile?: File }) => void;
  loading?: boolean;
}

export function CategoryModal({ categoria, onClose, onSave, loading = false }: ModalProps) {
  const [form, setForm] = useState({
    name: categoria?.name || '',
    slug: categoria?.slug || '',
    description: categoria?.description || '',
    is_active: categoria?.is_active ?? true,
    image_url: categoria?.image_url || '',
  });

  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const categoriaData: Partial<Category> & { pendingFile?: File } = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description || undefined,
      is_active: form.is_active,
      image_url: form.image_url || undefined,
      pendingFile: pendingFile || undefined,
    };

    onSave(categoriaData);
  }

  async function handleImageUpload(file: File, url: string) {
    setPendingFile(file);
    setForm((prev) => ({ ...prev, image_url: url }));
  }

  function handleImageRemove() {
    setPendingFile(null);
    setForm((prev) => ({ ...prev, image_url: '' }));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-md p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {categoria ? 'Editar Categoria' : 'Nova Categoria'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nome *</label>
            <input
              type="text"
              name="name"
              placeholder="Nome da categoria"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              placeholder="slug-da-categoria (gerado automaticamente se vazio)"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            />
            <p className="text-xs text-zinc-500 mt-1">Deixe vazio para gerar automaticamente</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
            <textarea
              name="description"
              placeholder="Descrição da categoria"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Imagem da Categoria
            </label>
            <ImageUpload
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              existingImages={form.image_url ? [form.image_url] : []}
              maxImages={1}
              disabled={loading}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Selecione uma imagem representativa para a categoria.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm text-zinc-700">Categoria ativa</label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-zinc-300 text-zinc-700 py-2 rounded-lg hover:bg-zinc-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[var(--lumike-gold)] text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
