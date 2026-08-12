import { ChevronRight, Loader2 } from 'lucide-react';

interface ExcelImporterFooterProps {
  itemCount: number;
  confirming: boolean;
  onClear: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExcelImporterFooter({
  itemCount,
  confirming,
  onClear,
  onConfirm,
  onCancel,
}: ExcelImporterFooterProps) {
  const hasItems = itemCount > 0;

  return (
    <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3 justify-end items-center">
      {hasItems && (
        <button
          onClick={onClear}
          disabled={confirming}
          className="px-5 py-2.5 text-zinc-500 hover:text-zinc-700 font-bold text-sm transition disabled:opacity-50"
        >
          Limpar e Trocar Planilha
        </button>
      )}
      <button
        onClick={hasItems ? onConfirm : onCancel}
        disabled={confirming || !hasItems}
        className={`px-8 py-2.5 rounded-xl font-bold transition shadow-md flex items-center gap-2 ${
          hasItems
            ? 'bg-(--lumilee-gold) text-white hover:opacity-90 shadow-orange-100 disabled:opacity-50'
            : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
        }`}
      >
        {confirming ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirmando...
          </>
        ) : hasItems ? (
          <>
            Confirmar Importação ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
            <ChevronRight className="h-4 w-4" />
          </>
        ) : (
          'Aguardando Planilha...'
        )}
      </button>
    </div>
  );
}
