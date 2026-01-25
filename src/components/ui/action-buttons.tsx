/**
 * ActionButtons Component
 * ------------------------------------
 * Componente reutilizável para botões de ação em tabelas.
 */

import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
  disabled?: boolean;
  className?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export function ActionButtons({
  onEdit,
  onDelete,
  onMore,
  disabled = false,
  className,
  editLabel = 'Editar',
  deleteLabel = 'Excluir',
}: ActionButtonsProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          disabled={disabled}
          className="text-[var(--lumike-gold)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={editLabel}
        >
          <Edit className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={disabled}
          className="text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={deleteLabel}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      {onMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMore();
          }}
          disabled={disabled}
          className="text-zinc-500 hover:text-zinc-700 disabled:opacity-50"
          aria-label="Mais opções"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

