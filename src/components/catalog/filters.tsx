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

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`/?${params.toString()}`);
  }, 300);

  const handleCategory = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    replace(`/?${params.toString()}`);
  };

  const handleCollection = (collection: string) => {
    const params = new URLSearchParams(searchParams);
    if (collection) {
      params.set('collection', collection);
    } else {
      params.delete('collection');
    }
    replace(`/?${params.toString()}`);
  };

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
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--lumike-gold)]"
        />
      </div>

      {/* Category Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <select
          defaultValue={searchParams.get('category')?.toString()}
          onChange={(e) => handleCategory(e.target.value)}
          className="pl-10 pr-8 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--lumike-gold)] appearance-none bg-white min-w-[200px]"
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
          className="pl-4 pr-8 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--lumike-gold)] appearance-none bg-white min-w-[200px]"
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
