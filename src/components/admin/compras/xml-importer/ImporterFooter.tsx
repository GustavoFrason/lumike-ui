import { ChevronRight } from 'lucide-react';

interface ImporterFooterProps {
  itemCount: number;
  onClear: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImporterFooter({ itemCount, onClear, onConfirm, onCancel }: ImporterFooterProps) {
  const hasItems = itemCount > 0;

  return (
    <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3 justify-end items-center">
      {hasItems && (
        <button
          onClick={onClear}
          className="px-5 py-2.5 text-zinc-500 hover:text-zinc-700 font-bold text-sm transition"
        >
          Limpar e Trocar Nota
        </button>
      )}
      <button
        onClick={hasItems ? onConfirm : onCancel}
        className={`px-8 py-2.5 rounded-xl font-bold transition shadow-md flex items-center gap-2 ${
          hasItems
            ? 'bg-(--lumike-gold) text-white hover:opacity-90 shadow-orange-100'
            : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
        }`}
        disabled={!hasItems}
      >
        {hasItems ? (
          <>
            Continuar com {itemCount} Itens
            <ChevronRight className="h-4 w-4" />
          </>
        ) : (
          'Aguardando XML...'
        )}
      </button>
    </div>
  );
}
