import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Order } from '@/lib/hooks/use-orders';

interface CustomerOrdersTableProps {
  orders: Order[];
  loadingOrders: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Concluído',
  pending: 'Pendente',
  paid: 'Pago',
};

const STATUS_CLASSES: Record<string, string> = {
  completed: 'bg-green-50 text-green-600 border border-green-100',
  pending: 'bg-amber-50 text-amber-600 border border-amber-100',
  paid: 'bg-blue-50 text-blue-600 border border-blue-100',
};

export function CustomerOrdersTable({ orders, loadingOrders }: CustomerOrdersTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-50 bg-zinc-50/50 flex justify-between items-center">
        <h2 className="font-bold text-zinc-800 font-serif">Histórico de Pedidos</h2>
        <span className="text-xs bg-zinc-100 px-3 py-1 rounded-full text-zinc-500 font-bold border border-zinc-200">
          {orders.length} itens
        </span>
      </div>

      {loadingOrders ? (
        <div className="p-12 text-center text-zinc-400 animate-pulse font-medium">
          Carregando histórico...
        </div>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50/50 text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4">Data & ID</th>
                <th className="px-6 py-4">Valor Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-bold text-zinc-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-mono">#{order.id}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-zinc-900">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        STATUS_CLASSES[order.status] ||
                        'bg-zinc-50 text-zinc-500 border border-zinc-200'
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/admin/vendas?highlight=${order.id}`}
                      className="inline-flex items-center gap-1.5 text-(--lumike-gold) hover:text-amber-600 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      <span>Detalhes</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-16 text-center text-zinc-400 italic">
          Nenhum pedido registrado para este cliente até o momento.
        </div>
      )}
    </div>
  );
}
