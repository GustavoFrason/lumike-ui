import { AlertTriangle, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { TransferBatchPreviewResponse } from '@/lib/services/transfer-batches.service';
import { formatRowNumbers, summarizeItems } from './transfer-preview';

interface TransferBatchPreviewProps {
  preview: TransferBatchPreviewResponse;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function TransferBatchPreview({
  preview,
  onQuantityChange,
  onRemove,
}: TransferBatchPreviewProps) {
  const totals = summarizeItems(preview.validos);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Peças a transferir" value={totals.pieces} />
        <SummaryCard label="Unidades" value={totals.units} />
        <SummaryCard label="Valor (preço atual)" value={formatCurrency(totals.value)} />
        <SummaryCard
          label="Com problema"
          value={preview.erros.length}
          tone={preview.erros.length > 0 ? 'warning' : 'neutral'}
        />
      </div>

      {preview.validos.length > 0 ? (
        <div className="border border-zinc-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-(--lumilee-beige)">
                <tr className="text-left text-zinc-700">
                  <th className="py-2.5 px-4 font-medium">Código</th>
                  <th className="py-2.5 px-4 font-medium">Peça</th>
                  <th className="py-2.5 px-4 font-medium text-right">Disponível</th>
                  <th className="py-2.5 px-4 font-medium text-right">Transferir</th>
                  <th className="py-2.5 px-4" />
                </tr>
              </thead>
              <tbody>
                {preview.validos.map((item) => (
                  <tr key={item.product_id} className="border-t border-zinc-100">
                    <td className="py-2.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold text-zinc-800">
                          {item.sku || '-'}
                        </span>
                        {item.sku2 && (
                          <span className="font-mono text-xs text-zinc-400">{item.sku2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-zinc-800">{item.name}</span>
                      {item.row_numbers.length > 1 && (
                        <span className="block text-[11px] text-zinc-400">
                          Somado das {formatRowNumbers(item.row_numbers).toLowerCase()}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right text-zinc-500">{item.available}</td>
                    <td className="py-2.5 px-4 text-right">
                      <input
                        type="number"
                        min={1}
                        max={item.available}
                        value={item.quantity}
                        onChange={(e) => onQuantityChange(item.product_id, Number(e.target.value))}
                        aria-label={`Quantidade de ${item.name}`}
                        className="w-20 py-1 px-2 border border-zinc-200 rounded-lg text-right focus:ring-2 focus:ring-(--lumilee-gold) focus:border-transparent outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onRemove(item.product_id)}
                        title="Tirar da transferência"
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-500 text-center py-6 bg-zinc-50 rounded-xl">
          Nenhuma peça válida para transferir.
        </p>
      )}

      {preview.erros.length > 0 && (
        <div className="border border-orange-200 bg-orange-50/60 rounded-xl p-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-orange-700 mb-3">
            <AlertTriangle className="h-4 w-4" />
            Ficam de fora da transferência ({preview.erros.length})
          </h4>
          <ul className="space-y-1.5 text-sm text-zinc-700">
            {preview.erros.map((erro) => (
              <li key={`${erro.row_numbers.join('-')}-${erro.code}`}>
                <span className="font-semibold">{formatRowNumbers(erro.row_numbers)}</span>
                {erro.code && <span className="font-mono text-zinc-500"> · {erro.code}</span>}:{' '}
                {erro.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number | string;
  tone?: 'neutral' | 'warning';
}) {
  return (
    <div
      className={
        tone === 'warning'
          ? 'p-4 rounded-xl border border-orange-200 bg-orange-50'
          : 'p-4 rounded-xl border border-zinc-200 bg-white'
      }
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      <p
        className={
          tone === 'warning'
            ? 'text-2xl font-serif font-medium text-orange-700 mt-1'
            : 'text-2xl font-serif font-medium text-zinc-900 mt-1'
        }
      >
        {value}
      </p>
    </div>
  );
}
