'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/services/users.service';
import { inventoryService, UserInventoryItem } from '@/lib/services/inventory.service';
import { ShoppingBag, X, Printer, Package, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface UserInventoryModalProps {
  user: User;
  onClose: () => void;
}

export function UserInventoryModal({ user, onClose }: UserInventoryModalProps) {
  const [items, setItems] = useState<UserInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, [user.id]);

  async function loadInventory() {
    try {
      setLoading(true);
      const data = await inventoryService.getUserStock(user.id);
      setItems(data);
    } catch (error) {
      console.error('Erro ao carregar inventário do usuário:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-(--lumike-gold)/10 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-(--lumike-gold)" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-zinc-900 font-medium">Inventário em Posse</h2>
              <p className="text-sm text-zinc-500">{user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm font-medium">Carregando itens...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-hidden border border-zinc-100 rounded-2xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3 text-center">SKU</th>
                      <th className="px-4 py-3 text-right">Qtd</th>
                      <th className="px-4 py-3 text-right">Valor Un.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {items.map((item) => (
                      <tr key={item.product_id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-4 py-4 font-medium text-zinc-900">{item.name}</td>
                        <td className="px-4 py-4 text-center text-zinc-500 font-mono text-xs">
                          {item.sku}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="bg-zinc-100 px-2 py-1 rounded text-xs font-bold text-zinc-700">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-zinc-600">
                          {formatCurrency(item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 text-center">
              <Package className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-zinc-500 font-medium">Nenhum produto em posse deste usuário.</p>
              <p className="text-xs max-w-[240px] mt-1">
                Transfira produtos do estoque central para que apareçam aqui.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                Total de Itens
              </span>
              <span className="text-lg font-bold text-zinc-900">{totalQuantity}</span>
            </div>
            <div className="flex flex-col border-l border-zinc-200 pl-6">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                Valor Total (Venda)
              </span>
              <span className="text-lg font-bold text-(--lumike-gold)">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => window.print()}
              disabled={items.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              <Printer className="h-4 w-4" /> Imprimir
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed > div {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
          }
          .fixed > div * {
            visibility: visible;
          }
          button {
            display: none !important;
          }
          .max-h-\[90vh\] {
            max-height: none !important;
            overflow: visible !important;
          }
          .overflow-y-auto {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
