/**
 * Loading Component
 * ------------------------------------
 * Componente reutilizável para estados de carregamento.
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  spinnerClassName?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Loading({ size = 'md', className, spinnerClassName, text }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-[var(--lumike-gold)]', sizeClasses[size], spinnerClassName)} />
      {text && <p className="text-sm text-zinc-600">{text}</p>}
    </div>
  );
}

