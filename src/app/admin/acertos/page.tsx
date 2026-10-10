'use client';

/**
 * Acertos com revendedoras
 * ------------------------------------
 * Lista as revendedoras com o que está na mala de cada uma e quanto falta
 * acertar. Clicar abre o extrato e o registro do acerto.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, HandCoins } from 'lucide-react';
import { resellersService, ResellerListItem } from '@/lib/services/resellers.service';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/utils';
import { ErrorMessage } from '@/components/ui/error-message';
import { Loading } from '@/components/ui/loading';

export default function AcertosPage() {
  const [resellers, setResellers] = useState<ResellerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resellersService
      .list()
      .then(setResellers)
      .catch((err) => setError(getErrorMessage(err, 'Erro ao carregar revendedoras.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <HandCoins className="h-6 w-6 text-(--lumilee-gold)" /> Acertos com Revendedoras
        </h1>
        <p className="text-sm text-zinc-500">
          A revendedora recebe dos clientes, fica com a comissão e repassa o restante à loja.
        </p>
      </div>

      <ErrorMessage message={error || ''} />

      {loading ? (
        <Loading text="Carregando revendedoras..." className="py-12" />
      ) : resellers.length === 0 ? (
        <p className="text-center text-zinc-500 py-12 bg-white border border-zinc-200 rounded-lg">
          Nenhuma revendedora cadastrada (usuários com papel &quot;vendedor&quot;).
        </p>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-[10px] uppercase text-zinc-400 font-bold">
              <tr>
                <th className="text-left px-4 py-2">Revendedora</th>
                <th className="text-right px-4 py-2">Na mala</th>
                <th className="text-right px-4 py-2">Vendas a acertar</th>
                <th className="text-right px-4 py-2">Saldo a repassar</th>
                <th className="text-left px-4 py-2">Último acerto</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {resellers.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">
                    {r.name}
                    {!r.is_active && (
                      <span className="ml-2 text-[10px] text-zinc-400 uppercase">inativa</span>
                    )}
                    <span className="block text-[11px] text-zinc-400">
                      comissão {r.commission_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.stock_pieces} peças
                    <span className="block text-[11px] text-zinc-400">
                      {formatCurrency(r.stock_value)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{r.unsettled_orders}</td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      r.balance_to_pay < 0 ? 'text-red-600' : 'text-zinc-900'
                    }`}
                  >
                    {formatCurrency(r.balance_to_pay)}
                    {r.balance_to_pay < 0 && (
                      <span className="block text-[10px] font-normal">loja deve a ela</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {r.last_settlement_at ? formatDate(r.last_settlement_at) : 'nunca'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/acertos/${r.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-(--lumilee-gold) hover:underline"
                    >
                      Fazer acerto <ChevronRight className="h-3.5 w-3.5" />
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
