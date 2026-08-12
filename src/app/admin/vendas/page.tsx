'use client';

import { useState, useEffect } from 'react';
import { useOrders, Order } from '@/lib/hooks/use-orders';
import { DataTable } from '@/components/ui/data-table';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { Pagination } from '@/components/ui/pagination';
import { PaginationInfo } from '@/components/ui/pagination-info';
import { getOrderPaymentBreakdown } from '@/lib/order-utils';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal';
import { SalesKpiCards } from './components/SalesKpiCards';
import { SalesFiltersBar } from './components/SalesFiltersBar';
import { getSalesColumns } from './components/sales-columns';

const ITEMS_PER_PAGE = 20;

const statusLabels: Record<string, string> = {
  pending: 'Análise/Pendente',
  paid: 'Pago',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  parcelado_boca: 'Parcelado Boca',
};

const statusColors: Record<string, 'pending' | 'active' | 'completed' | 'cancelled'> = {
  pending: 'pending',
  paid: 'completed',
  completed: 'completed',
  cancelled: 'cancelled',
  parcelado_boca: 'pending', // Alterado para pending (amarelo) para indicar atenção
};

export default function VendasPage() {
  const {
    orders,
    pagination,
    loadingOrders,
    errorOrders,
    loadOrders,
    updating,
    errorUpdating,
    updateOrderStatus,
    deleting,
    errorDeleting,
    deleteOrder,
  } = useOrders();

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders(currentPage, ITEMS_PER_PAGE, statusFilter || undefined);
  }, [loadOrders, currentPage, statusFilter]);

  // Filtragem no frontend (Complementar ao backend)
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.id.toString().includes(searchTerm) ||
      order.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const orderDate = new Date(order.created_at).toISOString().split('T')[0];
    const matchesDate =
      (!dateRange.start || orderDate >= dateRange.start) &&
      (!dateRange.end || orderDate <= dateRange.end);

    return matchesSearch && matchesDate;
  });

  // Cálculos de KPIs baseados na lista filtrada
  const kpis = {
    total: filteredOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
    pendente: filteredOrders.reduce((sum, o) => {
      // Se cancelado, não conta como pendente
      if (o.status === 'cancelled') return sum;
      return sum + getOrderPaymentBreakdown(o).saldo;
    }, 0),
    ticketMedio:
      filteredOrders.length > 0
        ? filteredOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) /
          filteredOrders.length
        : 0,
  };

  function handleWhatsApp(pedido: Order) {
    if (!pedido.customers?.phone) {
      alert('Telefone do cliente não cadastrado.');
      return;
    }

    const firstItem = pedido.items?.[0]?.products?.name || 'itens selecionados';
    const message = `Olá, ${pedido.customers.name}! ✨\n\nPassando para informar que seu pedido #${pedido.id} na Lumilee (*${firstItem}* e outros) foi atualizado para: *${statusLabels[pedido.status]}*.\n\nQualquer dúvida, estamos à disposição! 💎`;

    const encodedMessage = encodeURIComponent(message);
    const phone = pedido.customers.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
  }

  function exportToCSV() {
    const headers = [
      'Pedido',
      'Cliente',
      'WhatsApp',
      'Data',
      'Valor Total',
      'Valor Pago',
      'Saldo',
      'Status',
    ];
    const csvContent = [
      headers.join(','),
      ...orders.map((order) => {
        const { valorPago, saldo } = getOrderPaymentBreakdown(order);

        return [
          `#${order.id}`,
          `"${order.customers?.name || 'Cliente N/I'}"`,
          order.customers?.phone?.replace(/\D/g, '') || '',
          new Date(order.created_at).toLocaleDateString(),
          order.total_amount,
          valorPago,
          saldo,
          statusLabels[order.status] || order.status,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_lumilee_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleStatusChange(id: number, newStatus: string) {
    if (newStatus === 'cancelled') {
      const pedido = orders.find((o) => o.id === id);
      if (pedido) {
        setSelectedOrder(pedido);
        alert(
          'Para cancelar com estorno e devolução de estoque, utilize o botão "Cancelar Venda" dentro dos detalhes do pedido.',
        );
        return;
      }
    }
    try {
      await updateOrderStatus(id, newStatus);
      await loadOrders(currentPage, ITEMS_PER_PAGE, statusFilter || undefined);
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  async function handleExcluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) {
      return;
    }

    try {
      await deleteOrder(id);
      await loadOrders(currentPage, ITEMS_PER_PAGE, statusFilter || undefined);
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  if (loadingOrders) {
    return (
      <section className="space-y-6">
        <Loading size="lg" text="Carregando vendas..." className="py-12" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vendas</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition text-sm font-medium flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
          <Link
            href="/admin/vendas/nova"
            className="px-4 py-2 bg-(--lumilee-gold) text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
          >
            Nova Venda
          </Link>
        </div>
      </div>

      <SalesKpiCards total={kpis.total} ticketMedio={kpis.ticketMedio} pendente={kpis.pendente} />

      <SalesFiltersBar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
      />

      <ErrorMessage message={errorOrders || errorUpdating || errorDeleting || ''} />

      <DataTable
        data={filteredOrders}
        loading={loadingOrders}
        columns={getSalesColumns({
          statusLabels,
          statusColors,
          updating,
          deleting,
          onWhatsApp: handleWhatsApp,
          onStatusChange: handleStatusChange,
          onViewDetails: setSelectedOrder,
          onDelete: handleExcluir,
        })}
        onRowClick={(pedido) => setSelectedOrder(pedido)}
        emptyTitle="Nenhuma venda encontrada"
        emptyDescription="Tente ajustar seus filtros para encontrar o que procura"
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

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </section>
  );
}
