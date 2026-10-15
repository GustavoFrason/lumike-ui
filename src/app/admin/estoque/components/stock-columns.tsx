import { TrendingUp, TrendingDown, RefreshCcw, ClipboardCheck } from 'lucide-react';
import { Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { getStockStatus, STOCK_STATUS_LABELS, StockRow, StockStatus } from './stock-rows';

interface GetStockColumnsParams {
  onEntry: (produto: StockRow) => void;
  onExit: (produto: StockRow) => void;
  onTransfer: (produto: StockRow) => void;
  onAdjust: (produto: StockRow) => void;
  onSelect: (produto: StockRow) => void;
}

const STATUS_BADGE: Record<StockStatus, 'error' | 'pending' | 'active'> = {
  out: 'error',
  low: 'pending',
  normal: 'active',
};

const TOTAL_CLASS: Record<StockStatus, string> = {
  out: 'text-red-600 font-bold',
  low: 'text-orange-600 font-semibold',
  normal: 'text-zinc-700 font-semibold',
};

export function getStockColumns({
  onEntry,
  onExit,
  onTransfer,
  onAdjust,
  onSelect,
}: GetStockColumnsParams): Column<StockRow>[] {
  return [
    {
      key: 'code',
      header: 'Código',
      render: (produto) => (
        <div className="flex flex-col">
          <span className="text-zinc-800 font-mono text-sm font-semibold">
            {produto.sku || '-'}
          </span>
          {produto.sku2 && <span className="text-zinc-400 text-xs font-mono">{produto.sku2}</span>}
          {produto.sku2_alt && (
            <span className="text-zinc-400 text-xs font-mono" title="Código Zarpellon 2">
              {produto.sku2_alt}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Produto',
      render: (produto) => <span className="font-medium">{produto.name}</span>,
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (produto) => (
        <span className="text-zinc-500 text-xs">{produto.categories?.name || '-'}</span>
      ),
    },
    {
      key: 'central',
      header: 'Central',
      className: 'text-right',
      render: (produto) => <span className="text-zinc-600">{produto.stock_central}</span>,
    },
    {
      key: 'sellers',
      header: 'Revend.',
      className: 'text-right',
      render: (produto) => <span className="text-zinc-600">{produto.stock_sellers}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      render: (produto) => (
        <div className="whitespace-nowrap">
          <span className={TOTAL_CLASS[getStockStatus(produto)]}>{produto.stock_total}</span>
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
        const status = getStockStatus(produto);
        return <StatusBadge status={STATUS_BADGE[status]} label={STOCK_STATUS_LABELS[status]} />;
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
