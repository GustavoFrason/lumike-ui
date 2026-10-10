'use client';

/**
 * Minhas vendas (revendedora)
 * ------------------------------------
 * A revendedora vê as vendas dela no mês, o total vendido e a comissão.
 * A API já devolve só as vendas dela (a lista geral de vendas é da
 * gestão).
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Receipt } from 'lucide-react';
import { ordersService, Order, OrdersSummary } from '@/lib/services/orders.service';
import { formatCurrency, formatDate, getTodayInSaoPaulo } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/utils';
import { ErrorMessage } from '@/components/ui/error-message';
import { Loading } from '@/components/ui/loading';

/** 'YYYY-MM' → primeiro e último dia do mês. */
function monthRange(month: string): { dateFrom: string; dateTo: string } {
  const [year, m] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return {
    dateFrom: `${month}-01`,
    dateTo: `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

export default function MinhasVendasPage() {
  const [month, setMonth] = useState(() => getTodayInSaoPaulo().slice(0, 7));
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrdersSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => monthRange(month), [month]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      ordersService.getAll(1, 500, undefined, undefined, range),
      ordersService.getSummary(range),
    ])
      .then(([list, sum]) => {
        if (cancelled) return;
        setOrders(list.data);
        setSummary(sum);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Erro ao carregar suas vendas.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  // Resumo da própria revendedora (a API já filtra; pode não ter vendas).
  const mine = summary?.by_seller.find((s) => s.seller_id !== null);

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Minhas Vendas</h1>
          <p className="text-sm text-zinc-500">Vendas feitas por você no mês</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            aria-label="Mês"
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <Link
            href="/admin/vendas/nova"
            className="flex items-center gap-2 px-4 py-2 bg-(--lumilee-gold) text-white rounded-lg hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nova Venda
          </Link>
        </div>
      </div>

      <ErrorMessage message={error || ''} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <p className="text-xs uppercase text-zinc-400 font-semibold">Vendas</p>
          <p className="text-2xl font-bold">{summary?.totals.orders_count ?? 0}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <p className="text-xs uppercase text-zinc-400 font-semibold">Total vendido</p>
          <p className="text-2xl font-bold">{formatCurrency(summary?.totals.total ?? 0)}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <p className="text-xs uppercase text-zinc-400 font-semibold">
            Sua comissão{mine ? ` (${mine.commission_rate}%)` : ''}
          </p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(mine?.commission ?? 0)}
          </p>
        </div>
      </div>

      {loading ? (
        <Loading text="Carregando vendas..." className="py-12" />
      ) : orders.length === 0 ? (
        <p className="text-center text-zinc-500 py-12 bg-white border border-zinc-200 rounded-lg">
          Nenhuma venda neste mês.
        </p>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-[10px] uppercase text-zinc-400 font-bold">
              <tr>
                <th className="text-left px-4 py-2">Data</th>
                <th className="text-left px-4 py-2">Venda</th>
                <th className="text-left px-4 py-2">Cliente</th>
                <th className="text-right px-4 py-2">Total</th>
                <th className="text-left px-4 py-2">Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((order) => (
                <tr key={order.id} className={order.status === 'cancelled' ? 'opacity-50' : ''}>
                  <td className="px-4 py-2 whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-2 font-mono text-xs">#{order.id}</td>
                  <td className="px-4 py-2">{order.customers?.name ?? '—'}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-2">
                    {order.status === 'cancelled' ? 'Cancelada' : 'Concluída'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/vendas/recibo/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs text-(--lumilee-gold) hover:underline"
                    >
                      <Receipt className="h-3.5 w-3.5" /> Recibo
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
