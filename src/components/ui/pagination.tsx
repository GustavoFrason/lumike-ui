/**
 * Pagination Component
 * ------------------------------------
 * Componente reutilizável para paginação.
 */

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;

  // Calcula quais páginas mostrar
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-zinc-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'px-3 py-2 rounded-lg border transition',
            currentPage === page
              ? 'bg-[var(--lumike-gold)] text-white border-[var(--lumike-gold)]'
              : 'border-zinc-300 hover:bg-zinc-50',
          )}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-zinc-400">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
