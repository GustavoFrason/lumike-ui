import { Search } from 'lucide-react';
import type { User } from '@/lib/services/users.service';

interface DateRange {
  start: string;
  end: string;
}

interface SalesFiltersBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sellers: User[];
  /** '' = todas, 'none' = loja (sem vendedora), ou o id da vendedora. */
  sellerFilter: string;
  onSellerFilterChange: (value: string) => void;
  /** '' = qualquer, 'central' = Estoque Central, ou o id da revendedora. */
  stockFilter: string;
  onStockFilterChange: (value: string) => void;
}

const selectClass =
  'bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-(--lumilee-gold)';

export function SalesFiltersBar({
  searchTerm,
  onSearchTermChange,
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  sellers,
  sellerFilter,
  onSellerFilterChange,
  stockFilter,
  onStockFilterChange,
}: SalesFiltersBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative text-zinc-400 focus-within:text-(--lumilee-gold)">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors" />
          <input
            type="text"
            placeholder="Buscar por cliente ou ID..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-(--lumilee-gold) focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.start}
            aria-label="De"
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs px-2 py-2 focus:outline-none focus:ring-1 focus:ring-(--lumilee-gold)"
          />
          <input
            type="date"
            value={dateRange.end}
            aria-label="Até"
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs px-2 py-2 focus:outline-none focus:ring-1 focus:ring-(--lumilee-gold)"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className={selectClass}
        >
          <option value="">Todos os status</option>
          <option value="pending">Análise</option>
          <option value="parcelado_boca">Parcelado Boca</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={sellerFilter}
          onChange={(e) => onSellerFilterChange(e.target.value)}
          aria-label="Vendedora"
          className={selectClass}
        >
          <option value="">Todas as vendedoras</option>
          <option value="none">Loja (sem vendedora)</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => onStockFilterChange(e.target.value)}
          aria-label="Estoque de origem"
          className={selectClass}
        >
          <option value="">Qualquer estoque de origem</option>
          <option value="central">Estoque Central (loja)</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              Mala de {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
