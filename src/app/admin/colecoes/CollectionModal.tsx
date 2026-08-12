'use client';

import { useState } from 'react';
import { Collection, UpdateCollectionDto } from '@/lib/services/collections.service';

interface ModalProps {
  colecao: Collection | null;
  onClose: () => void;
  onSave: (colecao: UpdateCollectionDto) => void;
  loading?: boolean;
}

export function CollectionModal({ colecao, onClose, onSave, loading = false }: ModalProps) {
  const [form, setForm] = useState({
    nome: colecao?.nome || '',
    slug: colecao?.slug || '',
    descricao: colecao?.descricao || '',
    is_active: colecao?.is_active ?? true,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const colecaoData: UpdateCollectionDto = {
      nome: form.nome,
      slug: form.slug || undefined,
      descricao: form.descricao || undefined,
      is_active: form.is_active,
    };

    onSave(colecaoData);
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
          {colecao ? 'Editar Coleção' : 'Nova Coleção'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nome *</label>
            <input
              type="text"
              name="nome"
              placeholder="Nome da coleção"
              value={form.nome}
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
              placeholder="slug-da-colecao (gerado automaticamente se vazio)"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            />
            <p className="text-xs text-zinc-500 mt-1">Deixe vazio para gerar automaticamente</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
            <textarea
              name="descricao"
              placeholder="Descrição da coleção"
              value={form.descricao}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm text-zinc-700">Coleção ativa</label>
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
              className="flex-1 bg-[var(--lumilee-gold)] text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
