import { Search, Filter } from 'lucide-react';
import { Category } from '@/lib/services/categories.service';

interface ProductFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: number | undefined;
  onCategoryChange: (id: number | undefined) => void;
  categories: Category[];
}

export function ProductFiltersBar({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
}: ProductFiltersBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou SKU..."
          className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--lumike-gold)] focus:border-transparent outline-none transition"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <Filter className="h-4 w-4 text-zinc-400" />
        <select
          className="w-full md:w-48 py-2 px-3 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--lumike-gold)] focus:border-transparent outline-none transition bg-white text-zinc-700"
          value={categoryId || ''}
          onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Todas as Categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
