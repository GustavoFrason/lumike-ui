import { Package, Home, User as UserIcon, RefreshCcw, ChevronRight } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useInventory } from '@/lib/hooks/use-inventory';
import { Product } from '@/lib/services/products.service';

interface ProductStockDetailPanelProps {
  selectedProduct: Product | null;
  inventory: ReturnType<typeof useInventory>;
  onClose: () => void;
  onTransfer: (produto: Product) => void;
}

export function ProductStockDetailPanel({
  selectedProduct,
  inventory,
  onClose,
  onTransfer,
}: ProductStockDetailPanelProps) {
  if (!selectedProduct) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-12 text-center text-zinc-400 italic border-dashed sticky top-6">
        <Package className="h-12 w-12 mx-auto mb-4 text-zinc-200" />
        <p className="text-sm">
          Selecione um produto para visualizar a distribuição entre vendedores e o histórico.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden sticky top-6 animate-in slide-in-from-right-4 duration-300">
      <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-zinc-900 font-medium">{selectedProduct.name}</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">{selectedProduct.sku}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all"
        >
          ✕
        </button>
      </div>

      {/* Distribuição por Localidade */}
      <div className="p-6">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <RefreshCcw className="h-3 w-3" /> Distribuição de Estoque
        </h3>

        {inventory.loadingStock ? (
          <Loading size="sm" />
        ) : inventory.stock ? (
          <div className="space-y-3">
            {/* Central */}
            <div className="flex items-center justify-between p-4 bg-linear-to-br from-zinc-50 to-white rounded-2xl border border-zinc-100 group hover:border-(--lumilee-gold)/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-xs flex items-center justify-center text-(--lumilee-gold)">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-700">Estoque Lumilee</p>
                  <p className="text-[10px] text-zinc-400">Ponto de distribuição central</p>
                </div>
              </div>
              <span className="text-lg font-serif font-medium text-zinc-900">
                {inventory.stock.central}
              </span>
            </div>

            {/* Vendedores */}
            {inventory.stock.sellers.map((s) => (
              <div
                key={s.user_id}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 group hover:border-(--lumilee-gold)/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-(--lumilee-gold) transition-colors">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-700">{s.name}</p>
                    <p className="text-[10px] text-zinc-400">Revendedor(a)</p>
                  </div>
                </div>
                <span className="text-lg font-serif font-medium text-zinc-900">{s.quantity}</span>
              </div>
            ))}

            <div className="pt-2 border-t border-zinc-50 flex items-center justify-between px-2">
              <span className="text-sm font-bold text-zinc-400">Total Geral</span>
              <span className="text-xl font-serif font-bold text-(--lumilee-gold)">
                {inventory.stock.total}
              </span>
            </div>

            <button
              onClick={() => onTransfer(selectedProduct)}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <RefreshCcw className="h-4 w-4" /> Transferir para Revendedor
            </button>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 italic">Carregando estoque...</p>
        )}
      </div>

      {/* Histórico Recente */}
      <div className="p-6 bg-zinc-50/50 border-t border-zinc-50">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ChevronRight className="h-3 w-3" /> Histórico Recente
        </h3>
        {inventory.loadingHistory ? (
          <Loading size="sm" />
        ) : inventory.history.length > 0 ? (
          <div className="space-y-3">
            {inventory.history.slice(0, 3).map((movement) => (
              <div
                key={movement.id}
                className="bg-white p-3 rounded-xl border border-zinc-100 shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter',
                      movement.movement === 'IN'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700',
                    )}
                  >
                    {movement.movement === 'IN' ? 'Entrada' : 'Saída'}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {formatDate(movement.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-500 italic line-clamp-1">
                    {movement.reference || 'Sem ref.'}
                  </p>
                  <span
                    className={cn(
                      'font-bold text-sm',
                      movement.movement === 'IN' ? 'text-green-600' : 'text-red-600',
                    )}
                  >
                    {movement.movement === 'IN' ? '+' : ''}
                    {movement.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 italic">Nenhuma movimentação</p>
        )}
      </div>
    </div>
  );
}
