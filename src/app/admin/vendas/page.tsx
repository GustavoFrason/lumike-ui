'use client';

import { useState, useEffect } from 'react';
import { useOrders, Order } from '@/lib/hooks/use-orders';
import { DataTable, Column } from '@/components/ui/data-table';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { StatusBadge } from '@/components/ui/status-badge';
import { Pagination } from '@/components/ui/pagination';
import { PaginationInfo } from '@/components/ui/pagination-info';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Printer, ShieldCheck, MessageCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal';

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
  parcelado_boca: 'active',
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders(currentPage, ITEMS_PER_PAGE, statusFilter || undefined);
  }, [loadOrders, currentPage, statusFilter]);

  function handleWhatsApp(pedido: Order) {
    if (!pedido.customers?.phone) {
      alert('Telefone do cliente não cadastrado.');
      return;
    }

    const firstItem = pedido.items?.[0]?.products?.name || 'itens selecionados';
    const message = `Olá, ${pedido.customers.name}! ✨\n\nPassando para informar que seu pedido #${pedido.id} na Lumike (*${firstItem}* e outros) foi atualizado para: *${statusLabels[pedido.status]}*.\n\nQualquer dúvida, estamos à disposição! 💎`;

    const encodedMessage = encodeURIComponent(message);
    const phone = pedido.customers.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
  }

  function exportToCSV() {
    const headers = ['Pedido', 'Cliente', 'WhatsApp', 'Data', 'Valor Total', 'Valor Pago', 'Saldo', 'Status'];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => {
        const currentSaldo = order.payment_status === 'pago' ? 0 : (order.boca_value ?? order.total_amount);
        const valorPago = Math.max(0, order.total_amount - currentSaldo);
        const saldo = currentSaldo;

        return [
          `#${order.id}`,
          `"${order.customers?.name || 'Cliente N/I'}"`,
          order.customers?.phone?.replace(/\D/g, '') || '',
          new Date(order.created_at).toLocaleDateString(),
          order.total_amount,
          valorPago,
          saldo,
          statusLabels[order.status] || order.status
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_lumike_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleStatusChange(id: number, newStatus: string) {
    if (newStatus === 'cancelled') {
      const pedido = orders.find(o => o.id === id);
      if (pedido) {
        setSelectedOrder(pedido);
        alert('Para cancelar com estorno e devolução de estoque, utilize o botão "Cancelar Venda" dentro dos detalhes do pedido.');
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

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Pedido',
      render: (pedido) => <span className="font-medium">#{pedido.id}</span>,
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (pedido) => (
        <span>
          {pedido.customers?.name || 'Cliente não informado'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Data',
      render: (pedido) => formatDate(pedido.created_at),
    },
    {
      key: 'total_amount',
      header: 'Valor',
      render: (pedido) => (
        <span className="font-semibold">{formatCurrency(pedido.total_amount)}</span>
      ),
    },
    {
      key: 'valor_pago',
      header: 'Valor Pago',
      render: (pedido) => {
        // Calcular valor pago acumulado
        const saldo = pedido.payment_status === 'pago' ? 0 : (pedido.boca_value ?? pedido.total_amount);
        const valorPago = Math.max(0, pedido.total_amount - saldo);

        return (
          <span className={`font-medium ${valorPago > 0 ? 'text-green-600' : 'text-zinc-400'}`}>
            {formatCurrency(valorPago)}
          </span>
        );
      },
    },
    {
      key: 'saldo',
      header: 'Saldo',
      render: (pedido) => {
        // Calcular saldo pendente (usando boca_value como saldo universal)
        const saldo = pedido.payment_status === 'pago' ? 0 : (pedido.boca_value ?? pedido.total_amount);

        return (
          <span className={`font-semibold ${saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(saldo)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (pedido) => (
        <StatusBadge
          status={statusColors[pedido.status] || 'pending'}
          label={statusLabels[pedido.status] || pedido.status}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (pedido) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleWhatsApp(pedido)}
            className="p-1 text-green-600 hover:text-green-700"
            title="Enviar WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <select
            value={pedido.status}
            onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
            className="text-xs border rounded px-2 py-1"
            disabled={updating}
          >
            <option value="pending">Análise</option>
            <option value="parcelado_boca">Parcelado Boca</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <button
            onClick={() => setSelectedOrder(pedido)}
            className="text-blue-600 hover:underline text-xs font-medium"
          >
            Ver Detalhes
          </button>
          <button
            onClick={() => handleExcluir(pedido.id)}
            className="text-red-600 hover:text-red-700 text-sm"
            disabled={deleting}
          >
            Excluir
          </button>
          <Link
            href={`/admin/vendas/recibo/${pedido.id}`}
            target="_blank"
            className="p-1 text-zinc-400 hover:text-zinc-600"
            title="Imprimir Recibo"
          >
            <Printer className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/vendas/garantia/${pedido.id}`}
            target="_blank"
            className="p-1 text-[var(--lumike-gold)] hover:text-yellow-600"
            title="Certificado de Garantia"
          >
            <ShieldCheck className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

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
            className="px-4 py-2 bg-[var(--lumike-gold)] text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
          >
            Nova Venda
          </Link>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todos os status</option>
            <option value="pending">Análise</option>
            <option value="parcelado_boca">Parcelado Boca</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <ErrorMessage message={errorOrders || errorUpdating || errorDeleting || ''} />

      <DataTable
        data={orders}
        loading={loadingOrders}
        columns={columns}
        onRowClick={(pedido) => setSelectedOrder(pedido)}
        emptyTitle="Nenhuma venda encontrada"
        emptyDescription="As vendas aparecerão aqui quando forem criadas"
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
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}
