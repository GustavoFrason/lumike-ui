import { TrendingUp, TrendingDown, RefreshCcw, ClipboardCheck } from 'lucide-react';
import { Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Product } from '@/lib/services/products.service';

interface GetStockColumnsParams {
  onEntry: (produto: Product) => void;
  onExit: (produto: Product) => void;
  onTransfer: (produto: Product) => void;
  onAdjust: (produto: Product) => void;
  onSelect: (produto: Product) => void;
}

export function getStockColumns({
  onEntry,
  onExit,
  onTransfer,
  onAdjust,
  onSelect,
}: GetStockColumnsParams): Column<Product>[] {
  return [
    {
      key: 'name',
      header: 'Produto',
      render: (produto) => <span className="font-medium">{produto.name}</span>,
    },
    {
      key: 'stock',
      header: 'Estoque Total',
      render: (produto) => (
        <div>
          <span
            className={
              produto.current_stock <= 0
                ? 'text-red-600 font-bold'
                : produto.current_stock <= produto.min_stock
                  ? 'text-orange-600 font-semibold'
                  : 'text-zinc-700'
            }
          >
            {produto.current_stock}
          </span>
          {produto.min_stock > 0 && (
            <span className="text-zinc-400 text-xs ml-1">(mín: {produto.min_stock})</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (produto) => {
        const isOut = produto.current_stock <= 0;
        const isLow = produto.current_stock <= produto.min_stock;

        return (
          <StatusBadge
            status={isOut ? 'error' : isLow ? 'pending' : 'active'}
            label={isOut ? 'Esgotado' : isLow ? 'Estoque Baixo' : 'Normal'}
          />
        );
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (produto) => (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => onEntry(produto)}
            title="Entrada"
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onTransfer(produto)}
            title="Transferir entre malas"
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => onExit(produto)}
            title="Saída"
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrendingDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => onAdjust(produto)}
            title="Conferência de estoque"
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <ClipboardCheck className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSelect(produto)}
            className="text-(--lumilee-gold) hover:underline text-xs font-bold"
          >
            Detalhes
          </button>
        </div>
      ),
    },
  ];
}
