import Link from 'next/link';
import { Printer, ShieldCheck, MessageCircle } from 'lucide-react';
import { Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getOrderPaymentBreakdown } from '@/lib/order-utils';
import { Order } from '@/lib/services/orders.service';

interface GetSalesColumnsParams {
  statusLabels: Record<string, string>;
  statusColors: Record<string, 'pending' | 'active' | 'completed' | 'cancelled'>;
  updating: boolean;
  deleting: boolean;
  onWhatsApp: (pedido: Order) => void;
  onStatusChange: (id: number, newStatus: string) => void;
  onViewDetails: (pedido: Order) => void;
  onDelete: (id: number) => void;
}

export function getSalesColumns({
  statusLabels,
  statusColors,
  updating,
  deleting,
  onWhatsApp,
  onStatusChange,
  onViewDetails,
  onDelete,
}: GetSalesColumnsParams): Column<Order>[] {
  return [
    {
      key: 'id',
      header: 'Pedido',
      render: (pedido) => <span className="font-medium">#{pedido.id}</span>,
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (pedido) => <span>{pedido.customers?.name || 'Cliente não informado'}</span>,
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
        const { valorPago } = getOrderPaymentBreakdown(pedido);
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
        const { saldo } = getOrderPaymentBreakdown(pedido);
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
            onClick={() => onWhatsApp(pedido)}
            className="p-1 text-green-600 hover:text-green-700"
            title="Enviar WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <select
            value={pedido.status}
            onChange={(e) => onStatusChange(pedido.id, e.target.value)}
            className="text-xs border rounded px-2 py-1"
            disabled={updating}
          >
            <option value="pending">Análise</option>
            <option value="parcelado_boca">Parcelado Boca</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <button
            onClick={() => onViewDetails(pedido)}
            className="text-blue-600 hover:underline text-xs font-medium"
          >
            Ver Detalhes
          </button>
          <button
            onClick={() => onDelete(pedido.id)}
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
            className="p-1 text-(--lumilee-gold) hover:text-yellow-600"
            title="Certificado de Garantia"
          >
            <ShieldCheck className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];
}
