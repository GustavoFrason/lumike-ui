import { formatCurrency } from '@/lib/formatters';
import type { OrdersSummary } from '@/lib/services/orders.service';

interface SalesSellerSummaryProps {
  summary: OrdersSummary | null;
}

/**
 * Vendas por vendedora/loja no período filtrado (sem canceladas), com a
 * comissão de cada uma. Calculado no servidor sobre todas as vendas.
 */
export function SalesSellerSummary({ summary }: SalesSellerSummaryProps) {
  if (!summary || summary.by_seller.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-700">Vendas por vendedora</h2>
        <span className="text-xs text-zinc-400">sem canceladas · período filtrado</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-[10px] uppercase text-zinc-400 font-bold">
            <tr>
              <th className="text-left px-4 py-2">Vendedora</th>
              <th className="text-right px-4 py-2">Vendas</th>
              <th className="text-right px-4 py-2">Total</th>
              <th className="text-right px-4 py-2">Comissão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {summary.by_seller.map((row) => (
              <tr key={row.seller_id ?? 'loja'}>
                <td className="px-4 py-2 font-medium">{row.name}</td>
                <td className="px-4 py-2 text-right">{row.orders_count}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(row.total)}</td>
                <td className="px-4 py-2 text-right text-green-700">
                  {row.seller_id === null
                    ? '—'
                    : `${formatCurrency(row.commission)} (${row.commission_rate}%)`}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-zinc-50 font-semibold">
            <tr>
              <td className="px-4 py-2">Total</td>
              <td className="px-4 py-2 text-right">{summary.totals.orders_count}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(summary.totals.total)}</td>
              <td className="px-4 py-2 text-right text-green-700">
                {formatCurrency(summary.totals.commission)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
