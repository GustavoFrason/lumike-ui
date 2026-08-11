import { Search } from 'lucide-react';

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
}

export function SalesFiltersBar({
  searchTerm,
  onSearchTermChange,
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
}: SalesFiltersBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative text-zinc-400 focus-within:text-(--lumike-gold)">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors" />
          <input
            type="text"
            placeholder="Buscar por cliente ou ID..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-(--lumike-gold) focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs px-2 py-2 focus:outline-none focus:ring-1 focus:ring-(--lumike-gold)"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs px-2 py-2 focus:outline-none focus:ring-1 focus:ring-(--lumike-gold)"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-(--lumike-gold)"
        >
          <option value="">Todos os status</option>
          <option value="pending">Análise</option>
          <option value="parcelado_boca">Parcelado Boca</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>
    </div>
  );
}
