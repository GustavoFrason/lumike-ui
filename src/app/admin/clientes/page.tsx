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
import { formatDate, formatCurrency } from '@/lib/formatters';
import { UpdateCustomerDto } from '@/lib/services/customers.service';
import { accountsReceivableService, Debtor } from '@/lib/services/accounts-receivable.service';
import { useDebounce } from 'use-debounce';
import { Search, Users, Wallet, TrendingUp } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [debtors, setDebtors] = useState<Debtor[]>([]);

  useEffect(() => {
    loadCustomers(currentPage, ITEMS_PER_PAGE, debouncedSearch || undefined);
  }, [loadCustomers, currentPage, debouncedSearch]);

  // Carregar dados de devedores para os KPIs
  useEffect(() => {
    accountsReceivableService.getDebtors().then(setDebtors).catch(console.error);
  }, []);

  const totalDebt = debtors.reduce((sum, d) => sum + d.total_debt, 0);
  const totalWithDebt = debtors.length;

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
          className="font-medium text-(--lumike-taupe-dark) hover:text-(--lumike-gold) hover:underline"
        >
          {cliente.name}
        </Link>
      ),
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (cliente) => <span className="text-zinc-500">{cliente.email || '-'}</span>,
    },
    {
      key: 'phone',
      header: 'Telefone',
      render: (cliente) => <span className="text-zinc-500">{cliente.phone || '-'}</span>,
    },
    {
      key: 'cpf',
      header: 'CPF',
      render: (cliente) => <span className="text-zinc-500">{cliente.cpf || '-'}</span>,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-zinc-900">Clientes</h1>
          <p className="text-sm text-zinc-500">Gerencie sua base de clientes e acompanhe débitos</p>
        </div>
        <button
          onClick={handleNovoCliente}
          className="px-4 py-2 bg-(--lumike-gold) text-white rounded-lg hover:opacity-90 transition shadow-sm font-medium flex items-center justify-center gap-2"
        >
          <span>+ Novo Cliente</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total de Clientes</p>
          </div>
          <p className="text-2xl font-bold text-zinc-900 font-mono">
            {pagination?.total || customers.length}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-red-100 shadow-sm bg-red-50/30 text-red-600">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Wallet className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Inadimplência Total</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-red-600 font-mono">{formatCurrency(totalDebt)}</p>
            <span className="text-xs text-red-400 font-medium">({totalWithDebt} devedores)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Conversão de Ativos</p>
          </div>
          <p className="text-2xl font-bold text-zinc-900 font-mono">
            {Math.round((customers.length / (pagination?.total || 1)) * 100)}%
          </p>
          <p className="text-[10px] text-zinc-400 mt-1 italic">*Baseado na amostragem atual</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, CPF ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-(--lumike-gold) focus:bg-white focus:outline-none transition-all"
          />
        </div>
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
            className="px-4 py-2 bg-(--lumike-gold) text-white rounded-lg hover:opacity-90 transition"
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
