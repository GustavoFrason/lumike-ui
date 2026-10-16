'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  title: string;
  /** Uma linha abaixo do título. */
  description?: ReactNode;
  /** Conteúdo livre entre o cabeçalho e os botões. */
  children?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Texto do botão enquanto `loading`. */
  loadingLabel?: string;
  /** Excluir, cancelar venda etc.: botão vermelho. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmação no visual dos modais do painel, no lugar do `confirm()` do
 * navegador. Esc ou clique fora cancelam (menos durante `loading`).
 */
export function ConfirmDialog({
  title,
  description,
  children,
  icon: Icon = AlertTriangle,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loadingLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    // Captura no window: o Esc fecha só o diálogo, sem disparar os atalhos
    // da tela por trás (ex: Esc limpa o carrinho no PDV).
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      if (!loading) onCancel();
    }
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [loading, onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-8 border-b border-zinc-50 bg-linear-to-r from-zinc-50/50 to-white">
          <div className="flex items-center gap-3 mb-1">
            <Icon
              className={cn(
                'h-5 w-5 shrink-0',
                destructive ? 'text-red-500' : 'text-(--lumilee-gold)',
              )}
            />
            <h2 id="confirm-dialog-title" className="text-2xl font-serif text-zinc-900 font-medium">
              {title}
            </h2>
          </div>
          {description && <p className="text-zinc-500 text-sm">{description}</p>}
        </div>

        <div className="p-8 space-y-6">
          {children}

          <div className={cn('flex gap-4', children && 'pt-4 border-t border-zinc-50')}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:text-zinc-700 transition-colors border border-zinc-200 rounded-2xl disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              autoFocus
              className={cn(
                'flex-1 py-4 text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:shadow-none',
                destructive ? 'bg-red-600 shadow-red-100' : 'bg-(--lumilee-gold) shadow-orange-100',
              )}
            >
              {loading && loadingLabel ? loadingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type ConfirmOptions = Omit<
  ConfirmDialogProps,
  'onConfirm' | 'onCancel' | 'loading' | 'loadingLabel' | 'children'
>;

/**
 * `confirm()` assíncrono com o `ConfirmDialog`:
 *
 *   const { confirm, confirmDialog } = useConfirm();
 *   if (!(await confirm({ title: 'Excluir produto?', destructive: true }))) return;
 *   ...
 *   return <>{...}{confirmDialog}</>;
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    // Um pedido novo por cima de outro: o anterior conta como "não".
    resolveRef.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = useCallback((ok: boolean) => {
    resolveRef.current?.(ok);
    resolveRef.current = null;
    setOptions(null);
  }, []);
  const handleConfirm = useCallback(() => close(true), [close]);
  const handleCancel = useCallback(() => close(false), [close]);

  const confirmDialog = options ? (
    <ConfirmDialog {...options} onConfirm={handleConfirm} onCancel={handleCancel} />
  ) : null;

  return { confirm, confirmDialog, isConfirming: options !== null };
}
