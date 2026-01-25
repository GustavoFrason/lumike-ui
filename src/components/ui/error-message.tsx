/**
 * ErrorMessage Component
 * ------------------------------------
 * Componente reutilizável para exibir mensagens de erro.
 */

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, className, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between gap-2',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-700 hover:text-red-900 transition"
          aria-label="Fechar"
        >
          ✕
        </button>
      )}
    </div>
  );
}

