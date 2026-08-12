import { Trash2, AlertTriangle } from 'lucide-react';
import { CurrencyInputATM } from '@/components/ui/currency-input-atm';
import { formatCurrency, parseCurrencyBR } from '@/lib/formatters';
import { Category } from '@/lib/services/categories.service';
import { NewProductRow } from './types';

interface NewProductsTableProps {
  rows: NewProductRow[];
  categories: Category[];
  onUpdate: (rowNumber: number, patch: Partial<NewProductRow>) => void;
  onRemove: (rowNumber: number) => void;
}

export function NewProductsTable({ rows, categories, onUpdate, onRemove }: NewProductsTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50/50 border-b border-blue-100">
        <h3 className="text-sm font-bold text-blue-700">Produtos Novos ({rows.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-[10px] uppercase text-zinc-400 font-bold">
            <tr>
              <th className="text-left px-4 py-2">SKU Zarpellon</th>
              <th className="text-left px-4 py-2">Nome</th>
              <th className="text-left px-4 py-2">Categoria</th>
              <th className="text-center px-4 py-2">Qtd.</th>
              <th className="text-right px-4 py-2">Custo</th>
              <th className="text-right px-4 py-2">Preço Sugerido</th>
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
                <td className="px-4 py-2 min-w-[200px]">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => onUpdate(row.row_number, { name: e.target.value })}
                    className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-(--lumilee-gold) outline-none"
                  />
                </td>
                <td className="px-4 py-2 min-w-[160px]">
                  <select
                    value={row.category_id}
                    onChange={(e) =>
                      onUpdate(row.row_number, {
                        category_id: Number(e.target.value),
                        category_low_confidence: false,
                      })
                    }
                    className={`w-full border rounded px-2 py-1 ${
                      row.category_low_confidence ? 'border-amber-300 bg-amber-50' : ''
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {row.category_low_confidence && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 mt-0.5">
                      <AlertTriangle className="h-3 w-3" /> Confira a categoria
                    </span>
                  )}
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
                <td className="px-4 py-2 text-right text-zinc-500 whitespace-nowrap">
                  {formatCurrency(row.unit_cost * 3)}
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
