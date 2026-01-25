/**
 * StatusBadge Component
 * ------------------------------------
 * Componente reutilizável para badges de status.
 */

import { cn } from '@/lib/utils';

export type StatusVariant = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: StatusVariant | boolean;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
  active: {
    label: 'Ativo',
    className: 'bg-green-100 text-green-700',
  },
  inactive: {
    label: 'Inativo',
    className: 'bg-gray-100 text-gray-700',
  },
  pending: {
    label: 'Pendente',
    className: 'bg-yellow-100 text-yellow-700',
  },
  completed: {
    label: 'Concluído',
    className: 'bg-blue-100 text-blue-700',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-700',
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant: StatusVariant =
    typeof status === 'boolean' ? (status ? 'active' : 'inactive') : status;
  const config = statusConfig[variant];
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        config.className,
        className,
      )}
    >
      {displayLabel}
    </span>
  );
}

