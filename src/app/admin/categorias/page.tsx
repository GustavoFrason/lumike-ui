'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCategories } from '@/lib/hooks/use-categories';
import { imagesService } from '@/lib/services/images.service';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { CategoryModal } from './CategoryModal';
import { Category } from '@/lib/services/categories.service';

export default function CategoriasPage() {
  const {
    categories,
    loadingCategories,
    errorCategories,
    loadCategories,
    creating,
    errorCreating,
    createCategory,
    updating,
    errorUpdating,
    updateCategory,
    deleting,
    errorDeleting,
    deleteCategory,
  } = useCategories();

  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories(true); // Carrega apenas categorias ativas por padrão
  }, [loadCategories]);

  function handleNovaCategoria() {
    setCategoriaSelecionada(null);
    setModalAberto(true);
  }

  function handleEditar(categoria: Category) {
    setCategoriaSelecionada(categoria);
    setModalAberto(true);
  }

  async function handleSalvar(categoriaData: Partial<Category> & { pendingFile?: File }) {
    try {
      let finalImageUrl = categoriaData.image_url;

      // Se houver um arquivo pendente, faz o upload primeiro
      if (categoriaData.pendingFile) {
        finalImageUrl = await imagesService.uploadCategoryImage(categoriaData.pendingFile);
      }

      const cleanData = { ...categoriaData };
      delete cleanData.pendingFile;
      cleanData.image_url = finalImageUrl;

      if (categoriaSelecionada?.id) {
        await updateCategory(categoriaSelecionada.id, cleanData);
      } else {
        await createCategory(cleanData as Omit<Category, 'id' | 'created_at' | 'updated_at'>);
      }
      setModalAberto(false);
      await loadCategories(true);
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
    }
  }

  async function handleExcluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    try {
      await deleteCategory(id);
      await loadCategories(true);
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  if (loadingCategories) {
    return (
      <section className="space-y-6">
        <Loading size="lg" text="Carregando categorias..." className="py-12" />
      </section>
    );
  }

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (categoria) => <span className="font-medium">{categoria.name}</span>,
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (categoria) => (
        <span className="text-zinc-500 font-mono text-xs">{categoria.slug || '-'}</span>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (categoria) => (
        <span className="text-zinc-600 text-sm">{categoria.description || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (categoria) => <StatusBadge status={categoria.is_active} />,
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (categoria) => (
        <ActionButtons
          onEdit={() => handleEditar(categoria)}
          onDelete={() => handleExcluir(categoria.id)}
          disabled={updating || deleting}
        />
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categorias</h1>
        <button
          onClick={handleNovaCategoria}
          className="px-4 py-2 bg-[var(--lumike-gold)] text-white rounded-lg hover:opacity-90 transition"
        >
          + Nova Categoria
        </button>
      </div>

      <ErrorMessage
        message={errorCategories || errorCreating || errorUpdating || errorDeleting || ''}
      />

      <DataTable
        data={categories}
        loading={loadingCategories}
        columns={columns}
        emptyTitle="Nenhuma categoria cadastrada"
        emptyDescription="Comece criando sua primeira categoria"
        emptyAction={
          <button
            onClick={handleNovaCategoria}
            className="px-4 py-2 bg-[var(--lumike-gold)] text-white rounded-lg hover:opacity-90 transition"
          >
            Criar Primeira Categoria
          </button>
        }
      />

      {modalAberto && (
        <CategoryModal
          categoria={categoriaSelecionada}
          onClose={() => setModalAberto(false)}
          onSave={handleSalvar}
          loading={creating || updating}
        />
      )}
    </section>
  );
}
