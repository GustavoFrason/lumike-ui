'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface Category {
  id: number;
  name: string;
}

interface Collection {
  id: string;
  nome: string;
}

interface FiltersProps {
  categories: Category[];
  collections: Collection[];
}

export function Filters({ categories, collections }: FiltersProps) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  // Mudar um filtro volta para a 1ª página (a página atual pode nem existir
  // no novo resultado) e não rola a tela para o topo.
  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    replace(`/?${params.toString()}`, { scroll: false });
  };

  const handleSearch = useDebouncedCallback((term: string) => setFilter('q', term), 300);
  const handleCategory = (category: string) => setFilter('category', category);
  const handleCollection = (collection: string) => setFilter('collection', collection);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar produtos..."
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--lumilee-gold)]"
        />
      </div>

      {/* Category Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <select
          defaultValue={searchParams.get('category')?.toString()}
          onChange={(e) => handleCategory(e.target.value)}
          className="pl-10 pr-8 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--lumilee-gold)] appearance-none bg-white min-w-[200px]"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Collection Filter */}
      <div className="relative">
        <select
          defaultValue={searchParams.get('collection')?.toString()}
          onChange={(e) => handleCollection(e.target.value)}
          className="pl-4 pr-8 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--lumilee-gold)] appearance-none bg-white min-w-[200px]"
        >
          <option value="">Todas as coleções</option>
          {collections.map((col) => (
            <option key={col.id} value={col.id}>
              {col.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
