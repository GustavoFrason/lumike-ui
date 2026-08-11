import { AlertCircle } from 'lucide-react';
import { ErrorRow } from './types';

interface ErrorsListProps {
  rows: ErrorRow[];
}

export function ErrorsList({ rows }: ErrorsListProps) {
  if (rows.length === 0) return null;

  return (
    <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-red-100 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <h3 className="text-sm font-bold text-red-600">
          Linhas com Erro ({rows.length}) — ignoradas na importação
        </h3>
      </div>
      <ul className="divide-y divide-red-100 text-sm">
        {rows.map((row) => (
          <li key={row.row_number} className="px-4 py-2 flex items-center justify-between gap-4">
            <span className="text-zinc-600 truncate">
              Linha {row.row_number}: {row.name || row.sku2 || '(vazio)'}
            </span>
            <span className="text-[10px] uppercase font-bold text-red-500 shrink-0">
              {row.reason}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
