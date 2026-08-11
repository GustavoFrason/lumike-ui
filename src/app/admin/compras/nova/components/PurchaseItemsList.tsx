import { Package, Trash } from 'lucide-react';
import { CurrencyInputATM } from '@/components/ui/currency-input-atm';
import { formatCurrency, parseCurrencyBR } from '@/lib/formatters';
import { PurchaseItem } from './types';

interface PurchaseItemsListProps {
  items: PurchaseItem[];
  onUpdateItem: (productId: number, field: 'quantity' | 'unit_cost', value: number) => void;
  onRemoveItem: (productId: number) => void;
}

export function PurchaseItemsList({ items, onUpdateItem, onRemoveItem }: PurchaseItemsListProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b bg-zinc-50">
        <h3 className="font-semibold text-zinc-800">Itens da Compra</h3>
      </div>
      <div className="divide-y">
        {items.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum item adicionado à compra.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.product.id}
              className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900">{item.product.name}</p>
                <p className="text-xs text-zinc-500">SKU: {item.product.sku}</p>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-24">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Qtd</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(item.product.id, 'quantity', Number(e.target.value))}
                    className="w-full border rounded px-2 py-1.5 focus:ring-1 focus:ring-(--lumike-gold) outline-none"
                    min="1"
                  />
                </div>
                <div className="w-32">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Custo Unit.
                  </label>
                  <CurrencyInputATM
                    value={item.unit_cost}
                    onValueChange={(val: string | undefined) =>
                      onUpdateItem(item.product.id, 'unit_cost', parseCurrencyBR(val))
                    }
                    prefix="R$ "
                    className="w-full border rounded px-2 py-1.5 focus:ring-1 focus:ring-(--lumike-gold) outline-none"
                  />
                </div>
                <div className="text-right min-w-[100px]">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Subtotal
                  </label>
                  <span className="font-semibold text-zinc-900">
                    {formatCurrency(item.unit_cost * item.quantity)}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-red-400 hover:text-red-600 p-1 mt-5"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
