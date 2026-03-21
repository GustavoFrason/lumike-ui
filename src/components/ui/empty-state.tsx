/**
 * EmptyState Component
 * ------------------------------------
 * Componente reutilizável para estados vazios.
 */

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title = 'Nenhum item encontrado',
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('p-8 text-center text-zinc-500', className)}>
      {Icon && <Icon className="h-12 w-12 mx-auto mb-4 text-zinc-400" />}
      <h3 className="text-lg font-medium text-zinc-700 mb-2">{title}</h3>
      {description && <p className="text-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
