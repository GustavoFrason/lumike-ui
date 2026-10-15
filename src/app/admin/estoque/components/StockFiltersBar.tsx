import { Search, X } from 'lucide-react';
import { Category } from '@/lib/services/categories.service';
import { cn } from '@/lib/utils';
import {
  hasActiveStockFilters,
  STOCK_STATUS_LABELS,
  StockFilters,
  StockLocationFilter,
  StockStatus,
} from './stock-rows';

interface StockFiltersBarProps {
  filters: StockFilters;
  onChange: (filters: StockFilters) => void;
  onClear: () => void;
  categories: Category[];
  /** Revendedoras que têm alguma peça (opções do filtro de local). */
  sellers: { user_id: number; name: string }[];
  shownCount: number;
  totalCount: number;
}

const selectClass =
  'w-full py-2 px-3 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--lumilee-gold)] focus:border-transparent outline-none transition bg-white text-zinc-700';

const labelClass = 'text-[10px] font-bold text-zinc-400 uppercase tracking-widest';

/** "" → sem limite; senão o número digitado (nunca negativo). */
function parseQty(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : undefined;
}

function parseLocation(value: string): StockLocationFilter {
  if (value === 'all' || value === 'central') return value;
  return Number(value);
}

export function StockFiltersBar({
  filters,
  onChange,
  onClear,
  categories,
  sellers,
  shownCount,
  totalCount,
}: StockFiltersBarProps) {
  const set = (patch: Partial<StockFilters>) => onChange({ ...filters, ...patch });
  const active = hasActiveStockFilters(filters);

  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por nº do item, código Zarpellon ou nome..."
          className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--lumilee-gold)] focus:border-transparent outline-none transition"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className="space-y-1">
          <span className={labelClass}>Status</span>
          <select
            className={selectClass}
            value={filters.status}
            onChange={(e) => set({ status: e.target.value as 'all' | StockStatus })}
          >
            <option value="all">Todos</option>
            {(Object.keys(STOCK_STATUS_LABELS) as StockStatus[]).map((status) => (
              <option key={status} value={status}>
                {STOCK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className={labelClass}>Categoria</span>
          <select
            className={selectClass}
            value={filters.categoryId ?? ''}
            onChange={(e) =>
              set({ categoryId: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className={labelClass}>Local</span>
          <select
            className={selectClass}
            value={String(filters.location)}
            onChange={(e) => set({ location: parseLocation(e.target.value) })}
          >
            <option value="all">Todos os locais</option>
            <option value="central">Estoque Lumilee (Central)</option>
            {sellers.map((s) => (
              <option key={s.user_id} value={s.user_id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-1">
          <span className={labelClass}>Quantidade total</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="De"
              aria-label="Quantidade total mínima"
              className={selectClass}
              value={filters.minQty ?? ''}
              onChange={(e) => set({ minQty: parseQty(e.target.value) })}
            />
            <input
              type="number"
              min={0}
              placeholder="Até"
              aria-label="Quantidade total máxima"
              className={selectClass}
              value={filters.maxQty ?? ''}
              onChange={(e) => set({ maxQty: parseQty(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          {shownCount === totalCount
            ? `${totalCount} produto(s)`
            : `${shownCount} de ${totalCount} produto(s)`}
        </span>
        <button
          onClick={onClear}
          disabled={!active}
          className={cn(
            'inline-flex items-center gap-1 font-bold transition',
            active ? 'text-(--lumilee-gold) hover:underline' : 'text-zinc-300 cursor-default',
          )}
        >
          <X className="h-3.5 w-3.5" /> Limpar filtros
        </button>
      </div>
    </div>
  );
}
