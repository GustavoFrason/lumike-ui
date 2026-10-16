import { Trash2, AlertTriangle } from 'lucide-react';
import { CurrencyInputATM } from '@/components/ui/currency-input-atm';
import { formatCurrency, parseCurrencyBR } from '@/lib/formatters';
import { Category } from '@/lib/services/categories.service';
import { perKit, perPiece } from '@/lib/utils/kit-conversion';
import { NewProductRow } from './types';
import { PiecesPerKitInput } from './PiecesPerKitInput';

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
              <th className="text-left px-4 py-2">Código do fornecedor</th>
              <th className="text-left px-4 py-2">Nome</th>
              <th className="text-left px-4 py-2">Categoria</th>
              <th className="text-center px-4 py-2" title="Kit = peças iguais vendidas soltas">
                Peças/kit
              </th>
              <th className="text-center px-4 py-2">Qtd.</th>
              <th className="text-right px-4 py-2">Custo</th>
              <th className="text-right px-4 py-2">Preço de Venda</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => {
              const pieces = row.pieces_per_kit || 1;
              const isKit = pieces > 1;
              return (
                <tr key={row.row_number}>
                  <td className="px-4 py-2 font-mono text-xs text-zinc-500 whitespace-nowrap align-top">
                    {row.sku2}
                    {row.duplicated_in_file && (
                      <span
                        className="ml-1 text-amber-500"
                        title="SKU repetido no arquivo, quantidades somadas"
                      >
                        *
                      </span>
                    )}
                    {/* 2º código do fornecedor (alguns produtos têm dois) —
                        a busca e as próximas importações acham por qualquer um. */}
                    <input
                      type="text"
                      value={row.sku2_alt ?? ''}
                      onChange={(e) =>
                        onUpdate(row.row_number, { sku2_alt: e.target.value.toUpperCase() })
                      }
                      placeholder="Código 2"
                      aria-label="2º código do fornecedor"
                      maxLength={50}
                      className="block mt-1 w-28 border rounded px-2 py-0.5 text-[11px] font-mono"
                    />
                  </td>
                  <td className="px-4 py-2 min-w-[200px] align-top">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => onUpdate(row.row_number, { name: e.target.value })}
                      className="w-full border rounded px-2 py-1 focus:ring-1 focus:ring-(--lumilee-gold) outline-none"
                    />
                  </td>
                  <td className="px-4 py-2 min-w-[160px] align-top">
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
                  <td className="px-4 py-2 w-20 align-top">
                    <PiecesPerKitInput
                      value={pieces}
                      suggested={row.pieces_per_kit_suggested}
                      onChange={(value) =>
                        onUpdate(row.row_number, {
                          pieces_per_kit: value,
                          pieces_per_kit_suggested: false,
                        })
                      }
                    />
                  </td>
                  <td className="px-4 py-2 w-24 align-top">
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) =>
                        onUpdate(row.row_number, { quantity: Number(e.target.value) })
                      }
                      className="w-full border rounded px-2 py-1 text-center"
                    />
                    {isKit && (
                      <span className="block text-[10px] text-zinc-500 text-center mt-0.5">
                        = {row.quantity * pieces} peças
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 w-32 align-top">
                    <CurrencyInputATM
                      value={row.unit_cost}
                      onValueChange={(val: string | undefined) =>
                        onUpdate(row.row_number, { unit_cost: parseCurrencyBR(val) })
                      }
                      prefix="R$ "
                      className="w-full border rounded px-2 py-1 text-right"
                    />
                    {isKit && (
                      <span className="block text-[10px] text-zinc-500 text-right mt-0.5">
                        kit · {formatCurrency(perPiece(row.unit_cost, pieces))}/peça
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 w-32 align-top">
                    {/* Preço de venda de verdade: vem do "Valor de Venda" da
                        planilha quando preenchido, senão da regra padrão.
                        Em kit, edita o preço POR PEÇA (é o que vai na
                        etiqueta); o valor guardado continua o do kit e a
                        API divide pelas peças no confirm. */}
                    <CurrencyInputATM
                      value={isKit ? perPiece(row.suggested_price, pieces) : row.suggested_price}
                      onValueChange={(val: string | undefined) => {
                        const typed = parseCurrencyBR(val);
                        onUpdate(row.row_number, {
                          suggested_price: isKit ? perKit(typed, pieces) : typed,
                        });
                      }}
                      prefix="R$ "
                      className="w-full border rounded px-2 py-1 text-right"
                    />
                    {isKit && (
                      <span className="block text-[10px] text-zinc-500 text-right mt-0.5">
                        por peça
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2 align-top">
                    <button
                      onClick={() => onRemove(row.row_number)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Remover da importação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
