import { Save } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/formatters';
import { PurchaseItem } from './types';

interface PurchaseSummaryProps {
  items: PurchaseItem[];
  total: number;
  notes: string;
  onNotesChange: (value: string) => void;
  onFinalizar: () => void;
  creating: boolean;
  disabled: boolean;
}

export function PurchaseSummary({
  items,
  total,
  notes,
  onNotesChange,
  onFinalizar,
  creating,
  disabled,
}: PurchaseSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-lg sticky top-6">
      <h3 className="text-lg font-bold text-zinc-800 mb-6 border-b pb-4">Resumo da Compra</h3>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-zinc-600">
          <span>Total de Itens</span>
          <span className="font-medium">{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
        </div>
        <div className="flex justify-between items-center text-2xl font-bold text-zinc-900 pt-4 border-t">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 block mb-1">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-(--lumike-gold) outline-none"
            placeholder="Detalhes sobre a entrega, fatura, etc..."
          />
        </div>

        <button
          onClick={onFinalizar}
          disabled={disabled}
          className="w-full py-4 bg-(--lumike-gold) text-white rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-100 transition"
        >
          {creating ? (
            <Loading size="sm" spinnerClassName="text-white" />
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Salvar Compra</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
