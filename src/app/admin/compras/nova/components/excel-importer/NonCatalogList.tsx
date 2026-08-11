import { PackageX } from 'lucide-react';
import { NonCatalogRow } from './types';

interface NonCatalogListProps {
  rows: NonCatalogRow[];
}

export function NonCatalogList({ rows }: NonCatalogListProps) {
  if (rows.length === 0) return null;

  return (
    <div className="bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 flex items-center gap-2">
        <PackageX className="h-4 w-4 text-zinc-400" />
        <h3 className="text-sm font-bold text-zinc-600">
          Itens Não-Catalogáveis ({rows.length}) — não viram produto
        </h3>
      </div>
      <ul className="divide-y divide-zinc-200 text-sm">
        {rows.map((row) => (
          <li key={row.row_number} className="px-4 py-2 flex items-center justify-between gap-4">
            <span className="text-zinc-600 truncate">{row.name}</span>
            <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-200/60 px-2 py-0.5 rounded shrink-0">
              {row.matched_keyword}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
