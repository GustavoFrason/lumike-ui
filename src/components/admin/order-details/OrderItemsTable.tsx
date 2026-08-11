import { Package, Wrench } from 'lucide-react';
import { Order, OrderItem } from '@/lib/services/orders.service';
import { formatCurrency } from '@/lib/formatters';

interface OrderItemsTableProps {
  order: Order;
  onRepair: (product: OrderItem['products']) => void;
}

export function OrderItemsTable({ order, onRepair }: OrderItemsTableProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Package className="h-4 w-4 text-[var(--lumike-gold)]" /> Itens do Pedido
      </h3>
      <div className="border border-zinc-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="py-2 px-4 text-left font-medium text-zinc-600">Produto</th>
              <th className="py-2 px-4 text-center font-medium text-zinc-600">Qtd</th>
              <th className="py-2 px-4 text-right font-medium text-zinc-600">Unitário</th>
              <th className="py-2 px-4 text-right font-medium text-zinc-600">Total</th>
              <th className="py-2 px-4 text-center font-medium text-zinc-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td className="py-3 px-4 text-zinc-900">
                  {item.products?.name}
                  {item.products?.sku && (
                    <span className="block text-[10px] text-zinc-400">
                      SKU: {item.products.sku}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center text-zinc-600">{item.quantity}</td>
                <td className="py-3 px-4 text-right text-zinc-600">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="py-3 px-4 text-right font-medium text-zinc-900">
                  {formatCurrency(item.total_price)}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onRepair(item.products)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors border border-amber-100"
                    title="Mandar para Concerto"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-zinc-50/50">
            <tr>
              <td colSpan={3} className="py-3 px-4 text-right font-semibold text-zinc-900 text-lg">
                Total do Pedido
              </td>
              <td className="py-3 px-4 text-right font-bold text-[var(--lumike-gold)] text-lg">
                {formatCurrency(order.total_amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
