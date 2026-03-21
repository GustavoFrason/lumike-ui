/**
 * PaginationInfo Component
 * ------------------------------------
 * Componente para exibir informações de paginação.
 */

import { cn } from '@/lib/utils';

interface PaginationInfoProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  totalItems,
  itemsPerPage,
  className,
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn('text-sm text-zinc-600', className)}>
      Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de{' '}
      <strong>{totalItems}</strong> itens
    </div>
  );
}
