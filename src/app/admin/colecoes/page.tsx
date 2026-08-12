'use client';

import { useState, useEffect } from 'react';
import { useCollections } from '@/lib/hooks/use-collections';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { CollectionModal } from './CollectionModal';
import { Collection, UpdateCollectionDto } from '@/lib/services/collections.service';

export default function ColecoesPage() {
  const {
    collections,
    loadingCollections,
    errorCollections,
    loadCollections,
    creating,
    errorCreating,
    createCollection,
    updating,
    errorUpdating,
    updateCollection,
    deleting,
    errorDeleting,
    deleteCollection,
  } = useCollections();

  const [modalAberto, setModalAberto] = useState(false);
  const [colecaoSelecionada, setColecaoSelecionada] = useState<Collection | null>(null);

  useEffect(() => {
    loadCollections(true); // Carrega apenas coleções ativas por padrão
  }, [loadCollections]);

  function handleNovaColecao() {
    setColecaoSelecionada(null);
    setModalAberto(true);
  }

  function handleEditar(colecao: Collection) {
    setColecaoSelecionada(colecao);
    setModalAberto(true);
  }

  async function handleSalvar(colecaoData: UpdateCollectionDto) {
    try {
      if (colecaoSelecionada?.id) {
        await updateCollection(colecaoSelecionada.id, colecaoData);
      } else {
        await createCollection(
          colecaoData as unknown as Omit<Collection, 'id' | 'created_at' | 'updated_at'>,
        );
      }
      setModalAberto(false);
      await loadCollections(true);
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta coleção?')) {
      return;
    }

    try {
      await deleteCollection(id);
      await loadCollections(true);
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  if (loadingCollections) {
    return (
      <section className="space-y-6">
        <Loading size="lg" text="Carregando coleções..." className="py-12" />
      </section>
    );
  }

  const columns: Column<Collection>[] = [
    {
      key: 'nome',
      header: 'Nome',
      render: (colecao) => <span className="font-medium">{colecao.nome}</span>,
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (colecao) => (
        <span className="text-zinc-500 font-mono text-xs">{colecao.slug || '-'}</span>
      ),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (colecao) => (
        <span className="text-zinc-600 text-sm">{colecao.descricao || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (colecao) => <StatusBadge status={colecao.is_active} />,
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (colecao) => (
        <ActionButtons
          onEdit={() => handleEditar(colecao)}
          onDelete={() => handleExcluir(colecao.id)}
          disabled={updating || deleting}
        />
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Coleções</h1>
        <button
          onClick={handleNovaColecao}
          className="px-4 py-2 bg-[var(--lumilee-gold)] text-white rounded-lg hover:opacity-90 transition"
        >
          + Nova Coleção
        </button>
      </div>

      <ErrorMessage
        message={errorCollections || errorCreating || errorUpdating || errorDeleting || ''}
      />

      <DataTable
        data={collections}
        loading={loadingCollections}
        columns={columns}
        emptyTitle="Nenhuma coleção cadastrada"
        emptyDescription="Comece criando sua primeira coleção"
        emptyAction={
          <button
            onClick={handleNovaColecao}
            className="px-4 py-2 bg-[var(--lumilee-gold)] text-white rounded-lg hover:opacity-90 transition"
          >
            Criar Primeira Coleção
          </button>
        }
      />

      {modalAberto && (
        <CollectionModal
          colecao={colecaoSelecionada}
          onClose={() => setModalAberto(false)}
          onSave={handleSalvar}
          loading={creating || updating}
        />
      )}
    </section>
  );
}
