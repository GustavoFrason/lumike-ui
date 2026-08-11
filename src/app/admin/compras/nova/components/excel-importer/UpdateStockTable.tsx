import { Trash2 } from 'lucide-react';
import { CurrencyInputATM } from '@/components/ui/currency-input-atm';
import { parseCurrencyBR } from '@/lib/formatters';
import { UpdateStockRow } from './types';

interface UpdateStockTableProps {
  rows: UpdateStockRow[];
  onUpdate: (rowNumber: number, patch: Partial<UpdateStockRow>) => void;
  onRemove: (rowNumber: number) => void;
}

export function UpdateStockTable({ rows, onUpdate, onRemove }: UpdateStockTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-green-100 overflow-hidden">
      <div className="px-4 py-3 bg-green-50/50 border-b border-green-100">
        <h3 className="text-sm font-bold text-green-700">
          Entrada em Produtos Existentes ({rows.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-[10px] uppercase text-zinc-400 font-bold">
            <tr>
              <th className="text-left px-4 py-2">SKU Zarpellon</th>
              <th className="text-left px-4 py-2">Produto no Catálogo</th>
              <th className="text-center px-4 py-2">Estoque Atual</th>
              <th className="text-center px-4 py-2">Qtd. a Somar</th>
              <th className="text-right px-4 py-2">Custo</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <tr key={row.row_number}>
                <td className="px-4 py-2 font-mono text-xs text-zinc-500 whitespace-nowrap">
                  {row.sku2}
                  {row.duplicated_in_file && (
                    <span
                      className="ml-1 text-amber-500"
                      title="SKU repetido no arquivo, quantidades somadas"
                    >
                      *
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-zinc-700">{row.existing_product.name}</td>
                <td className="px-4 py-2 text-center text-zinc-500">
                  {row.existing_product.current_stock}
                </td>
                <td className="px-4 py-2 w-20">
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) => onUpdate(row.row_number, { quantity: Number(e.target.value) })}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </td>
                <td className="px-4 py-2 w-32">
                  <CurrencyInputATM
                    value={row.unit_cost}
                    onValueChange={(val: string | undefined) =>
                      onUpdate(row.row_number, { unit_cost: parseCurrencyBR(val) })
                    }
                    prefix="R$ "
                    className="w-full border rounded px-2 py-1 text-right"
                  />
                </td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => onRemove(row.row_number)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Remover da importação"
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
  );
}
