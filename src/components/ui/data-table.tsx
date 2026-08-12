/**
 * DataTable Component
 * ------------------------------------
 * Componente reutilizável para tabelas de dados.
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from './empty-state';
import { Package } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  loading?: boolean;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  emptyTitle = 'Nenhum item encontrado',
  emptyDescription,
  emptyAction,
  onRowClick,
  className,
  loading = false,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-pulse space-y-3 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-zinc-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        <EmptyState
          icon={Package}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--lumilee-beige)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn('py-3 px-4 text-left font-medium text-zinc-700', column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  'hover:bg-zinc-50 border-t transition',
                  onRowClick && 'cursor-pointer',
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('py-3 px-4', column.className)}>
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
