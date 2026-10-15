import { ChevronRight, Loader2 } from 'lucide-react';
import type { TransferTotals } from './transfer-preview';

interface TransferBatchFooterProps {
  totals: TransferTotals;
  confirming: boolean;
  onClear: () => void;
  onConfirm: () => void;
}

export function TransferBatchFooter({
  totals,
  confirming,
  onClear,
  onConfirm,
}: TransferBatchFooterProps) {
  const hasItems = totals.pieces > 0;

  return (
    <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-col sm:flex-row gap-3 justify-end items-center">
      <button
        onClick={onClear}
        disabled={confirming}
        className="px-5 py-2.5 text-zinc-500 hover:text-zinc-700 font-bold text-sm transition disabled:opacity-50"
      >
        Limpar e Trocar Planilha
      </button>
      <button
        onClick={onConfirm}
        disabled={confirming || !hasItems}
        className="px-8 py-2.5 rounded-xl font-bold transition shadow-md flex items-center gap-2 bg-(--lumilee-gold) text-white hover:opacity-90 shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {confirming ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Transferindo...
          </>
        ) : (
          <>
            Transferir {totals.pieces} {totals.pieces === 1 ? 'peça' : 'peças'} ({totals.units}{' '}
            {totals.units === 1 ? 'unidade' : 'unidades'})
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
