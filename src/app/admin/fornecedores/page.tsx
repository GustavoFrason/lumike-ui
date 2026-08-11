'use client';

import { useState, useEffect } from 'react';
import { SupplierModal } from './SupplierModal';
import { useSuppliers } from '@/lib/hooks/use-suppliers';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { DataTable } from '@/components/ui/data-table';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Pagination } from '@/components/ui/pagination';
import { PaginationInfo } from '@/components/ui/pagination-info';
import { PaginatedSuppliers, Supplier } from '@/lib/services/suppliers.service';
import { PlusCircle } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function FornecedoresPage() {
  const {
    suppliers,
    loading,
    error,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } = useSuppliers();

  const [modalAberto, setModalAberto] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Supplier | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedSuppliers['pagination'] | null>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await loadSuppliers(currentPage, ITEMS_PER_PAGE);
      if (res?.pagination) {
        setPagination(res.pagination);
      }
    }
    fetchData();
  }, [loadSuppliers, currentPage]);

  function handleNovoFornecedor() {
    setFornecedorSelecionado(null);
    setModalAberto(true);
  }

  function handleEditar(fornecedor: Supplier) {
    setFornecedorSelecionado(fornecedor);
    setModalAberto(true);
  }

  async function handleSalvar(fornecedorData: Partial<Supplier>) {
    try {
      if (fornecedorSelecionado?.id) {
        await updateSupplier(fornecedorSelecionado.id, fornecedorData);
      } else {
        await createSupplier(fornecedorData);
      }
      setModalAberto(false);
      loadSuppliers(currentPage, ITEMS_PER_PAGE);
    } catch (err) {
      // Erro é tratado pelo hook
    }
  }

  async function handleExcluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) {
      return;
    }
    try {
      await deleteSupplier(id);
      loadSuppliers(currentPage, ITEMS_PER_PAGE);
    } catch (err) {
      // Erro é tratado pelo hook
    }
  }

  if (loading && suppliers.length === 0) {
    return <Loading size="lg" text="Carregando fornecedores..." className="py-12" />;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 font-inter">Fornecedores</h1>
          <p className="text-sm text-zinc-500">
            Gerencie seus fornecedores e parceiros de produção.
          </p>
        </div>
        <button
          onClick={handleNovoFornecedor}
          className="flex items-center gap-2 px-4 py-2 bg-(--lumike-gold) text-white rounded-lg hover:opacity-90 transition shadow-sm font-medium"
        >
          <PlusCircle className="h-4 w-4" />
          Novo Fornecedor
        </button>
      </div>

      <ErrorMessage message={error || ''} />

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <DataTable
          data={suppliers}
          columns={[
            {
              key: 'name',
              header: 'Fornecedor',
              render: (s) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-900">{s.name}</span>
                  {s.category && <span className="text-xs text-zinc-500">{s.category}</span>}
                </div>
              ),
            },
            {
              key: 'contact',
              header: 'Contato',
              render: (s) => (
                <div className="flex flex-col">
                  <span className="text-sm text-zinc-700">{s.contact_name || '-'}</span>
                  <span className="text-xs text-zinc-500">{s.phone || '-'}</span>
                </div>
              ),
            },
            {
              key: 'email',
              header: 'E-mail',
              render: (s) => <span className="text-sm text-zinc-600">{s.email || '-'}</span>,
            },
            {
              key: 'document',
              header: 'Documento',
              render: (s) => <span className="text-sm text-zinc-600">{s.document || '-'}</span>,
            },
            {
              key: 'actions',
              header: 'Ações',
              className: 'text-right',
              render: (s) => (
                <ActionButtons
                  onEdit={() => handleEditar(s)}
                  onDelete={() => handleExcluir(s.id)}
                />
              ),
            },
          ]}
          emptyTitle="Nenhum fornecedor cadastrado"
          emptyDescription="Comece cadastrando seus parceiros de negócio para rastrear custos e ROI."
        />
      </div>

      {pagination && pagination.total > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-4">
          <PaginationInfo
            currentPage={currentPage}
            totalItems={pagination.total}
            itemsPerPage={ITEMS_PER_PAGE}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(pagination.total / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {modalAberto && (
        <SupplierModal
          supplier={fornecedorSelecionado}
          onClose={() => setModalAberto(false)}
          onSave={handleSalvar}
          loading={loading}
        />
      )}
    </section>
  );
}
