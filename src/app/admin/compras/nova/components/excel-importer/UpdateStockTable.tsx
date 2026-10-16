import { Trash2, AlertTriangle } from 'lucide-react';
import { CurrencyInputATM } from '@/components/ui/currency-input-atm';
import { formatCurrency, parseCurrencyBR } from '@/lib/formatters';
import { perPiece } from '@/lib/utils/kit-conversion';
import { Supplier } from '@/lib/services/suppliers.service';
import { UpdateStockRow } from './types';
import { PiecesPerKitInput } from './PiecesPerKitInput';

interface UpdateStockTableProps {
  rows: UpdateStockRow[];
  /** Fornecedor escolhido para a importação ('' = ainda não escolhido). */
  selectedSupplierId: number | '';
  suppliers: Supplier[];
  onUpdate: (rowNumber: number, patch: Partial<UpdateStockRow>) => void;
  onRemove: (rowNumber: number) => void;
}

export function UpdateStockTable({
  rows,
  selectedSupplierId,
  suppliers,
  onUpdate,
  onRemove,
}: UpdateStockTableProps) {
  if (rows.length === 0) return null;

  const supplierName = (id: number) =>
    suppliers.find((s) => s.id === id)?.name ?? `fornecedor #${id}`;

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
              <th className="text-left px-4 py-2">Código do fornecedor</th>
              <th className="text-left px-4 py-2">Produto no Catálogo</th>
              <th className="text-center px-4 py-2">Estoque Atual</th>
              <th className="text-center px-4 py-2" title="Kit = peças iguais vendidas soltas">
                Peças/kit
              </th>
              <th className="text-center px-4 py-2">Qtd. a Somar</th>
              <th className="text-right px-4 py-2">Custo</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => {
              const product = row.existing_product;
              const pieces = row.pieces_per_kit || 1;
              const isKit = pieces > 1;
              // Código igual ao de uma peça de outro fornecedor: pode ser
              // coincidência, e aí o estoque entraria na peça errada.
              const otherSupplierId =
                selectedSupplierId !== '' &&
                product.supplier_id != null &&
                product.supplier_id !== selectedSupplierId
                  ? product.supplier_id
                  : null;
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
                    {product.matched_by === 'sku2_alt' && (
                      <span className="block text-[10px] text-zinc-400 font-sans">
                        achado pelo 2º código
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-zinc-700 align-top">
                    {product.name}
                    {product.price !== undefined && (
                      <span className="block text-[10px] text-zinc-400">
                        Preço atual: {formatCurrency(product.price)}
                      </span>
                    )}
                    {(product.match_count ?? 1) > 1 && (
                      <span className="flex items-center gap-1 text-[10px] text-red-600 mt-0.5">
                        <AlertTriangle className="h-3 w-3" />
                        {product.match_count} produtos com este código — usando o item {product.id}
                      </span>
                    )}
                    {otherSupplierId !== null && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 mt-0.5">
                        <AlertTriangle className="h-3 w-3" />
                        Cadastrado como {supplierName(otherSupplierId)}: confira se é a mesma peça
                      </span>
                    )}
                    {isKit && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 mt-0.5">
                        <AlertTriangle className="h-3 w-3" />
                        Estoque entra em peças: confira se o preço atual é por peça
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-zinc-500 align-top">
                    {product.current_stock}
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
