'use client';

/**
 * Acerto com revendedora (extrato + registro)
 * ------------------------------------
 * Vendas ainda não acertadas até o fim do período (marcadas por padrão):
 *   recebido   = vendas que saíram da mala dela (dinheiro com ela)
 *   comissão   = taxa dela × vendas em que ela é a vendedora
 *   a repassar = recebido − comissão
 * + saldo de acertos anteriores. Registrar o acerto grava tudo de uma vez
 * (e a mesma venda nunca entra em dois acertos).
 */

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, HandCoins, Package, Truck } from 'lucide-react';
import {
  computeSelectedTotals,
  resellersService,
  ResellerStatement,
  Settlement,
} from '@/lib/services/resellers.service';
import { formatCurrency, formatDate, getTodayInSaoPaulo, parseCurrencyBR } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/utils';
import { CurrencyInputATM } from '@/components/ui/currency-input-atm';
import { ErrorMessage } from '@/components/ui/error-message';
import { Loading } from '@/components/ui/loading';
import { useConfirm } from '@/components/ui/confirm-dialog';

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

type Direction = 'from_reseller' | 'to_reseller';

export default function AcertoRevendedoraPage({ params }: { params: Promise<{ id: string }> }) {
  const { confirm, confirmDialog } = useConfirm();
  const { id: idParam } = use(params);
  const resellerId = Number(idParam);
  const today = getTodayInSaoPaulo();

  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState(today);
  const [startTouched, setStartTouched] = useState(false);

  const [statement, setStatement] = useState<ResellerStatement | null>(null);
  const [history, setHistory] = useState<Settlement[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulário
  const [direction, setDirection] = useState<Direction>('from_reseller');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [st, hist] = await Promise.all([
        resellersService.getStatement(resellerId, periodStart || undefined, periodEnd),
        resellersService.listSettlements(resellerId),
      ]);
      setStatement(st);
      setHistory(hist);
      setSelected(new Set(st.orders.map((o) => o.id)));
      // Período começa no dia seguinte ao último acerto (se a pessoa não mexeu)
      if (!startTouched && !periodStart && st.last_settlement) {
        setPeriodStart(addDays(st.last_settlement.period_end, 1));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao montar o extrato.'));
    } finally {
      setLoading(false);
    }
  }, [resellerId, periodStart, periodEnd, startTouched]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedOrders = useMemo(
    () => statement?.orders.filter((o) => selected.has(o.id)) ?? [],
    [statement, selected],
  );
  const totals = useMemo(
    () => computeSelectedTotals(selectedOrders, statement?.reseller.commission_rate ?? 0),
    [selectedOrders, statement],
  );
  const previousBalance = statement?.previous_balance ?? 0;
  const totalToSettle = Math.round((totals.amount_due + previousBalance) * 100) / 100;

  // Sugere o valor do acerto = total a acertar (no sentido certo)
  useEffect(() => {
    setDirection(totalToSettle < 0 ? 'to_reseller' : 'from_reseller');
    setAmount(Math.abs(totalToSettle));
  }, [totalToSettle]);

  function toggleOrder(orderId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  async function handleRegister() {
    if (!statement) return;
    const signedAmount = direction === 'from_reseller' ? amount : -amount;
    const confirmMsg =
      direction === 'from_reseller'
        ? `Registrar acerto: ${statement.reseller.name} paga ${formatCurrency(amount)} à loja?`
        : `Registrar acerto: a loja paga ${formatCurrency(amount)} a ${statement.reseller.name}?`;
    const ok = await confirm({
      title: 'Registrar acerto?',
      description: confirmMsg,
      icon: HandCoins,
      confirmLabel: 'Registrar acerto',
    });
    if (!ok) return;

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { id } = await resellersService.createSettlement(resellerId, {
        period_start: periodStart || undefined,
        period_end: periodEnd,
        order_ids: [...selected],
        amount_paid: signedAmount,
        expected_amount_due: totals.amount_due,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      });
      setSuccess(`Acerto #${id} registrado.`);
      setNotes('');
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao registrar o acerto.'));
      // 409 = extrato desatualizado: recarrega pra conferir
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (loading && !statement) {
    return <Loading text="Montando extrato..." className="py-12" />;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/acertos" className="text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <HandCoins className="h-6 w-6 text-(--lumilee-gold)" />
            Acerto — {statement?.reseller.name ?? `#${resellerId}`}
          </h1>
          <p className="text-sm text-zinc-500">
            Comissão de {statement?.reseller.commission_rate ?? 0}% sobre as vendas dela.
          </p>
        </div>
      </div>

      <ErrorMessage message={error || ''} />
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          {success}
        </p>
      )}

      {/* Período */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-wrap items-end gap-4">
        <label className="text-xs font-semibold uppercase text-zinc-500">
          De
          <input
            type="date"
            value={periodStart}
            max={periodEnd}
            onChange={(e) => {
              setStartTouched(true);
              setPeriodStart(e.target.value);
            }}
            className="block mt-1 border rounded-lg px-3 py-2 text-sm font-normal"
          />
        </label>
        <label className="text-xs font-semibold uppercase text-zinc-500">
          Até
          <input
            type="date"
            value={periodEnd}
            max={today}
            onChange={(e) => setPeriodEnd(e.target.value || today)}
            className="block mt-1 border rounded-lg px-3 py-2 text-sm font-normal"
          />
        </label>
        <p className="text-[11px] text-zinc-400 max-w-sm">
          Entram todas as vendas ainda não acertadas até a data final (inclusive vendas lançadas
          depois com data passada). O início vale para envios e devoluções.
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard label="Recebido (da mala)" value={formatCurrency(totals.collected)} />
        <SummaryCard
          label={`Comissão (${statement?.reseller.commission_rate ?? 0}%)`}
          value={`− ${formatCurrency(totals.commission)}`}
          tone="green"
        />
        <SummaryCard label="A repassar" value={formatCurrency(totals.amount_due)} />
        <SummaryCard label="Saldo anterior" value={formatCurrency(previousBalance)} />
        <SummaryCard
          label="Total a acertar"
          value={formatCurrency(totalToSettle)}
          tone={totalToSettle < 0 ? 'red' : 'gold'}
          hint={totalToSettle < 0 ? 'loja deve a ela' : undefined}
        />
      </div>

      {/* Vendas */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-700">
            Vendas a acertar ({selectedOrders.length} de {statement?.orders.length ?? 0} ·{' '}
            {totals.pieces} peças)
          </h2>
          {loading && <span className="text-xs text-zinc-400">atualizando...</span>}
        </div>
        {statement && statement.orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-[10px] uppercase text-zinc-400 font-bold">
                <tr>
                  <th className="px-4 py-2 w-8"></th>
                  <th className="text-left px-4 py-2">Data</th>
                  <th className="text-left px-4 py-2">Venda</th>
                  <th className="text-left px-4 py-2">Cliente</th>
                  <th className="text-right px-4 py-2">Peças</th>
                  <th className="text-right px-4 py-2">Total</th>
                  <th className="text-left px-4 py-2">Origem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {statement.orders.map((o) => (
                  <tr key={o.id} className={selected.has(o.id) ? '' : 'opacity-50'}>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(o.id)}
                        onChange={() => toggleOrder(o.id)}
                        aria-label={`Incluir venda #${o.id}`}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-2 font-mono text-xs">#{o.id}</td>
                    <td className="px-4 py-2">{o.customer_name ?? '—'}</td>
                    <td className="px-4 py-2 text-right">{o.pieces}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-2 text-xs text-zinc-500">
                      {o.from_her_stock ? 'mala dela' : 'estoque da loja'}
                      {!o.is_her_sale && ' · vendida por outra pessoa'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-zinc-500 py-8 text-sm">
            Nenhuma venda a acertar até {formatDate(periodEnd)}.
          </p>
        )}
      </div>

      {/* Mala */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-1">
          <h3 className="text-sm font-bold text-zinc-700 flex items-center gap-2">
            <Truck className="h-4 w-4 text-zinc-400" /> Movimento da mala no período
          </h3>
          <p className="text-sm">
            Enviadas: <strong>{statement?.transfers.sent_pieces ?? 0}</strong> peças (
            {formatCurrency(statement?.transfers.sent_value ?? 0)})
          </p>
          <p className="text-sm">
            Devolvidas: <strong>{statement?.transfers.returned_pieces ?? 0}</strong> peças (
            {formatCurrency(statement?.transfers.returned_value ?? 0)})
          </p>
          <p className="text-[11px] text-zinc-400">Valores pelo preço atual de cada peça.</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-zinc-700 flex items-center gap-2">
            <Package className="h-4 w-4 text-zinc-400" /> Está com ela agora
          </h3>
          <p className="text-sm mt-1">
            <strong>{statement?.current_stock.pieces ?? 0}</strong> peças ·{' '}
            {formatCurrency(statement?.current_stock.value ?? 0)}
          </p>
          {statement && statement.current_stock.items.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-(--lumilee-gold) cursor-pointer">Ver peças</summary>
              <ul className="mt-2 max-h-48 overflow-y-auto text-xs divide-y divide-zinc-100">
                {statement.current_stock.items.map((item) => (
                  <li key={item.product_id} className="py-1 flex justify-between gap-2">
                    <span>
                      {item.sku ? `${item.sku} · ` : ''}
                      {item.name}
                    </span>
                    <span className="text-zinc-500 whitespace-nowrap">
                      {item.quantity} × {formatCurrency(item.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      {/* Registrar */}
      <div className="bg-white border-2 border-(--lumilee-gold)/30 rounded-lg p-4 space-y-4">
        <h2 className="text-sm font-bold text-zinc-700">Registrar acerto</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="text-xs font-semibold uppercase text-zinc-500">
            Quem pagou
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
              className="block w-full mt-1 border rounded-lg px-3 py-2 text-sm font-normal"
            >
              <option value="from_reseller">Revendedora → Loja</option>
              <option value="to_reseller">Loja → Revendedora</option>
            </select>
          </label>
          <label className="text-xs font-semibold uppercase text-zinc-500">
            Valor pago
            <CurrencyInputATM
              value={amount}
              onValueChange={(val: string | undefined) => setAmount(parseCurrencyBR(val))}
              prefix="R$ "
              className="block w-full mt-1 border rounded-lg px-3 py-2 text-sm font-normal text-right"
            />
          </label>
          <label className="text-xs font-semibold uppercase text-zinc-500">
            Forma
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="block w-full mt-1 border rounded-lg px-3 py-2 text-sm font-normal"
            >
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="transferencia">Transferência</option>
              <option value="outro">Outro</option>
            </select>
          </label>
          <label className="text-xs font-semibold uppercase text-zinc-500">
            Observação
            <input
              type="text"
              value={notes}
              maxLength={500}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full mt-1 border rounded-lg px-3 py-2 text-sm font-normal"
            />
          </label>
        </div>
        <p className="text-[11px] text-zinc-500">
          Valor diferente do total? A diferença fica como saldo para o próximo acerto. O caixa
          recebe só o que ainda não tinha entrado por essas vendas.
        </p>
        <button
          onClick={handleRegister}
          disabled={saving || loading || !statement}
          className="px-6 py-2 bg-(--lumilee-gold) text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Registrando...' : 'Registrar acerto'}
        </button>
      </div>

      {/* Histórico */}
      {history.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-x-auto">
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-bold text-zinc-700">Acertos anteriores</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-[10px] uppercase text-zinc-400 font-bold">
              <tr>
                <th className="text-left px-4 py-2">Nº</th>
                <th className="text-left px-4 py-2">Feito em</th>
                <th className="text-left px-4 py-2">Até</th>
                <th className="text-right px-4 py-2">Vendas</th>
                <th className="text-right px-4 py-2">A repassar</th>
                <th className="text-right px-4 py-2">Pago</th>
                <th className="text-left px-4 py-2">Forma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {history.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2 font-mono text-xs">#{s.id}</td>
                  <td className="px-4 py-2">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-2">{formatDate(s.period_end)}</td>
                  <td className="px-4 py-2 text-right">{s.orders_count}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(s.amount_due)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(s.amount_paid)}</td>
                  <td className="px-4 py-2 text-zinc-500">{s.payment_method ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {confirmDialog}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: 'green' | 'red' | 'gold';
  hint?: string;
}) {
  const color =
    tone === 'green'
      ? 'text-green-700'
      : tone === 'red'
        ? 'text-red-600'
        : tone === 'gold'
          ? 'text-(--lumilee-gold)'
          : 'text-zinc-900';
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4">
      <p className="text-[10px] uppercase text-zinc-400 font-semibold">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {hint && <p className="text-[10px] text-zinc-400">{hint}</p>}
    </div>
  );
}
