import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPageWindow } from '@/lib/pagination';
import { CatalogFilters, catalogPageHref } from '@/lib/catalog-query';

interface CatalogPaginationProps {
  filters: CatalogFilters;
  totalPages: number;
  className?: string;
}

const itemClass = 'px-3 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 transition';
const arrowClass = 'p-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 transition';

/**
 * Paginação da vitrine com links (`?page=N`) em vez de callbacks: renderiza
 * no servidor e cada página tem URL própria (compartilhável e indexável).
 */
export function CatalogPagination({ filters, totalPages, className }: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const currentPage = Math.min(filters.page, totalPages);
  const { start, end, pages } = getPageWindow(currentPage, totalPages);
  const href = (page: number) => catalogPageHref(filters, page);

  return (
    <nav
      aria-label="Paginação do catálogo"
      className={cn('flex items-center justify-center gap-2 font-inter text-sm', className)}
    >
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} className={arrowClass} aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(arrowClass, 'opacity-50')} aria-hidden="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {start > 1 && (
        <>
          <Link href={href(1)} className={itemClass}>
            1
          </Link>
          {start > 2 && <span className="px-2 text-zinc-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={href(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(
            itemClass,
            page === currentPage &&
              'bg-[var(--lumilee-gold)] text-white border-[var(--lumilee-gold)] hover:bg-[var(--lumilee-gold)]',
          )}
        >
          {page}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-zinc-400">...</span>}
          <Link href={href(totalPages)} className={itemClass}>
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)} className={arrowClass} aria-label="Próxima página">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(arrowClass, 'opacity-50')} aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
