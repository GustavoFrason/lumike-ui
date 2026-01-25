'use client';

import { useState, useEffect } from 'react';
import { useCustomers, Customer } from '@/lib/hooks/use-customers';
import { DataTable, Column } from '@/components/ui/data-table';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Pagination } from '@/components/ui/pagination';
import { PaginationInfo } from '@/components/ui/pagination-info';
import { CustomerModal } from './CustomerModal';
import { formatDate } from '@/lib/formatters';
import { UpdateCustomerDto } from '@/lib/services/customers.service';
import Link from 'next/link';

const ITEMS_PER_PAGE = 20;

export default function ClientesPage() {
  const {
    customers,
    pagination,
    loadingCustomers,
    errorCustomers,
    loadCustomers,
    creating,
    errorCreating,
    createCustomer,
    updating,
    errorUpdating,
    updateCustomer,
    deleting,
    errorDeleting,
    deleteCustomer,
  } = useCustomers();

  const [modalAberto, setModalAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCustomers(currentPage, ITEMS_PER_PAGE);
  }, [loadCustomers, currentPage]);

  function handleNovoCliente() {
    setClienteSelecionado(null);
    setModalAberto(true);
  }

  function handleEditar(cliente: Customer) {
    setClienteSelecionado(cliente);
    setModalAberto(true);
  }

  async function handleSalvar(clienteData: UpdateCustomerDto) {
    try {
      if (clienteSelecionado?.id) {
        await updateCustomer(clienteSelecionado.id, clienteData);
      } else {
        await createCustomer(clienteData as unknown as Omit<Customer, 'id' | 'created_at'>);
      }
      setModalAberto(false);
      await loadCustomers(currentPage, ITEMS_PER_PAGE);
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  async function handleExcluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await deleteCustomer(id);
      await loadCustomers(currentPage, ITEMS_PER_PAGE);
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  const columns: Column<Customer>[] = [

    {
      key: 'name',
      header: 'Nome',
      render: (cliente) => (
        <Link
          href={`/admin/clientes/${cliente.id}`}
          className="font-medium text-[var(--lumike-taupe-dark)] hover:text-[var(--lumike-gold)] hover:underline"
        >
          {cliente.name}
        </Link>
      ),
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (cliente) => (
        <span className="text-zinc-500">{cliente.email || '-'}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Telefone',
      render: (cliente) => (
        <span className="text-zinc-500">{cliente.phone || '-'}</span>
      ),
    },
    {
      key: 'cpf',
      header: 'CPF',
      render: (cliente) => (
        <span className="text-zinc-500">{cliente.cpf || '-'}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Cadastrado em',
      render: (cliente) => formatDate(cliente.created_at),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (cliente) => (
        <ActionButtons
          onEdit={() => handleEditar(cliente)}
          onDelete={() => handleExcluir(cliente.id)}
          disabled={updating || deleting}
        />
      ),
    },
  ];

  if (loadingCustomers) {
    return (
      <section className="space-y-6">
        <Loading size="lg" text="Carregando clientes..." className="py-12" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <button
          onClick={handleNovoCliente}
          className="px-4 py-2 bg-[var(--lumike-gold)] text-white rounded-lg hover:opacity-90 transition"
        >
          + Novo Cliente
        </button>
      </div>

      <ErrorMessage
        message={errorCustomers || errorCreating || errorUpdating || errorDeleting || ''}
      />

      <DataTable
        data={customers}
        loading={loadingCustomers}
        columns={columns}
        emptyTitle="Nenhum cliente cadastrado"
        emptyDescription="Comece criando seu primeiro cliente"
        emptyAction={
          <button
            onClick={handleNovoCliente}
            className="px-4 py-2 bg-[var(--lumike-gold)] text-white rounded-lg hover:opacity-90 transition"
          >
            Criar Primeiro Cliente
          </button>
        }
      />

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
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {modalAberto && (
        <CustomerModal
          cliente={clienteSelecionado}
          onClose={() => setModalAberto(false)}
          onSave={handleSalvar}
          loading={creating || updating}
        />
      )}
    </section>
  );
}
