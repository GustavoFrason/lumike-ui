'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, ChevronLeft, Download, Printer } from 'lucide-react';
import { ErrorMessage } from '@/components/ui/error-message';
import { Loading } from '@/components/ui/loading';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import {
  transferBatchesService,
  TransferBatchDetail,
} from '@/lib/services/transfer-batches.service';
import { getErrorMessage } from '@/lib/utils';
import { exportRomaneioToExcel } from '../components/export-romaneio';
import { batchLocationLabel, summarizeItems } from '../components/transfer-preview';

/**
 * Romaneio do lote: lista de peças para mandar junto com a mala e a
 * revendedora conferir/assinar. Imprime direto (o layout admin já esconde
 * cabeçalho e menu na impressão) ou baixa em Excel.
 */
export default function RomaneioPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [batch, setBatch] = useState<TransferBatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(id)) return;
    transferBatchesService
      .getById(id)
      .then(setBatch)
      .catch((err) => setError(getErrorMessage(err, 'Erro ao carregar a transferência.')));
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!batch) return <Loading size="lg" text="Carregando romaneio..." className="py-12" />;

  const totals = summarizeItems(batch.items);
  const fromLabel = batchLocationLabel(batch.from_user_id, batch.from_name);
  const toLabel = batchLocationLabel(batch.to_user_id, batch.to_name);

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <Link
          href="/admin/estoque/transferencias"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Voltar para as transferências
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportRomaneioToExcel(batch)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition"
          >
            <Download className="h-4 w-4" /> Baixar Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 print:border-0 print:shadow-none print:p-0 print:rounded-none">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Romaneio de transferência
            </p>
            <h1 className="text-2xl font-serif text-zinc-900 font-medium mt-1">Lote #{batch.id}</h1>
            <p className="mt-3 inline-flex flex-wrap items-center gap-2 text-zinc-800 font-medium">
              {fromLabel}
              <ArrowRight className="h-4 w-4 text-zinc-400" />
              {toLabel}
            </p>
          </div>
          <dl className="text-sm text-zinc-600 space-y-1 sm:text-right">
            <div>
              <dt className="inline text-zinc-400">Data: </dt>
              <dd className="inline">{formatDateTime(batch.created_at)}</dd>
            </div>
            {batch.created_by_name && (
              <div>
                <dt className="inline text-zinc-400">Feito por: </dt>
                <dd className="inline">{batch.created_by_name}</dd>
              </div>
            )}
          </dl>
        </div>

        {batch.notes && (
          <p className="mt-4 text-sm text-zinc-600">
            <span className="text-zinc-400">Observação: </span>
            {batch.notes}
          </p>
        )}

        <table className="w-full text-sm mt-6">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-200">
              <th className="py-2 pr-4 font-bold">Código</th>
              <th className="py-2 pr-4 font-bold">Peça</th>
              <th className="py-2 pr-4 font-bold text-right">Qtd</th>
              <th className="py-2 pr-4 font-bold text-right">Preço</th>
              <th className="py-2 font-bold text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {batch.items.map((item) => (
              <tr key={item.product_id} className="border-b border-zinc-100 break-inside-avoid">
                <td className="py-2 pr-4 align-top">
                  <span className="font-mono font-semibold text-zinc-800">{item.sku || '-'}</span>
                  {item.sku2 && (
                    <span className="block font-mono text-xs text-zinc-400">{item.sku2}</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-zinc-700 align-top">{item.name}</td>
                <td className="py-2 pr-4 text-right font-semibold text-zinc-800 align-top">
                  {item.quantity}
                </td>
                <td className="py-2 pr-4 text-right text-zinc-500 align-top">
                  {formatCurrency(item.price)}
                </td>
                <td className="py-2 text-right text-zinc-700 align-top">
                  {formatCurrency(item.quantity * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold text-zinc-900">
              <td className="pt-3 pr-4" colSpan={2}>
                Total ({totals.pieces} {totals.pieces === 1 ? 'item' : 'itens'})
              </td>
              <td className="pt-3 pr-4 text-right">{totals.units}</td>
              <td className="pt-3 pr-4" />
              <td className="pt-3 text-right">{formatCurrency(totals.value)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-3 text-[11px] text-zinc-400">Valores pelo preço atual de cada peça.</p>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-12 break-inside-avoid">
          <Signature label="Entregue por" name={fromLabel} />
          <Signature label="Recebido por" name={toLabel} />
        </div>
      </div>
    </section>
  );
}

function Signature({ label, name }: { label: string; name: string }) {
  return (
    <div className="text-center">
      <div className="border-t border-zinc-400 pt-2">
        <p className="text-sm font-medium text-zinc-800">{label}</p>
        <p className="text-xs text-zinc-500">{name}</p>
      </div>
    </div>
  );
}
