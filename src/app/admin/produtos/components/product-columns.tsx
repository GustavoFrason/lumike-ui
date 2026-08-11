import { Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ActionButtons } from '@/components/ui/action-buttons';
import { formatCurrency } from '@/lib/formatters';
import { Product } from '@/lib/services/products.service';

interface GetProductColumnsParams {
  selectedIds: number[];
  allSelected: boolean;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onEdit: (produto: Product) => void;
  onDelete: (id: number) => void;
  onRepair: (produto: Product) => void;
  actionsDisabled: boolean;
}

export function getProductColumns({
  selectedIds,
  allSelected,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onRepair,
  actionsDisabled,
}: GetProductColumnsParams): Column<Product>[] {
  return [
    {
      key: 'selection',
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          className="rounded border-zinc-300 text-[var(--lumike-gold)] focus:ring-[var(--lumike-gold)]"
        />
      ),
      render: (produto) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(produto.id)}
          onChange={() => onToggleSelect(produto.id)}
          className="rounded border-zinc-300 text-[var(--lumike-gold)] focus:ring-[var(--lumike-gold)]"
        />
      ),
      className: 'w-10',
    },
    {
      key: 'id',
      header: 'ID',
      render: (produto) => <span className="text-zinc-500 text-xs font-mono">#{produto.id}</span>,
      className: 'w-16',
    },
    {
      key: 'name',
      header: 'Nome',
      render: (produto) => <span className="font-medium">{produto.name}</span>,
    },
    {
      key: 'sku',
      header: 'SKU / SKU2',
      render: (produto) => (
        <div className="flex flex-col">
          <span className="text-zinc-700 font-mono text-sm">{produto.sku || '-'}</span>
          {produto.sku2 && <span className="text-zinc-400 text-xs font-mono">{produto.sku2}</span>}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Preço',
      render: (produto) =>
        produto.preco_promocional ? (
          <div>
            <span className="line-through text-zinc-400">{formatCurrency(produto.price)}</span>
            <span className="ml-2 text-[var(--lumike-gold)] font-semibold">
              {formatCurrency(produto.preco_promocional)}
            </span>
          </div>
        ) : (
          formatCurrency(produto.price)
        ),
    },
    {
      key: 'stock',
      header: 'Estoque',
      render: (produto) => (
        <div>
          <span className={produto.current_stock <= produto.min_stock ? 'text-red-600 font-semibold' : ''}>
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
      render: (produto) => <StatusBadge status={produto.is_active} />,
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (produto) => (
        <ActionButtons
          onEdit={() => onEdit(produto)}
          onDelete={() => onDelete(produto.id)}
          onRepair={() => onRepair(produto)}
          disabled={actionsDisabled}
        />
      ),
    },
  ];
}
