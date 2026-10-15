import { AlertTriangle, ArrowRight, Home, Package, User as UserIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { TransferTotals } from './transfer-preview';

interface TransferConfirmModalProps {
  fromLabel: string;
  toLabel: string;
  /** Central (true) ou revendedora — só muda o ícone. */
  fromIsCentral: boolean;
  toIsCentral: boolean;
  totals: TransferTotals;
  notes: string;
  confirming: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmação da transferência em lote, no mesmo visual do TransferStockModal. */
export function TransferConfirmModal({
  fromLabel,
  toLabel,
  fromIsCentral,
  toIsCentral,
  totals,
  notes,
  confirming,
  onCancel,
  onConfirm,
}: TransferConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-confirm-title"
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-8 border-b border-zinc-50 bg-linear-to-r from-zinc-50/50 to-white">
          <div className="flex items-center gap-3 mb-1">
            <Package className="h-5 w-5 text-(--lumilee-gold)" />
            <h2
              id="transfer-confirm-title"
              className="text-2xl font-serif text-zinc-900 font-medium"
            >
              Confirmar Transferência
            </h2>
          </div>
          <p className="text-zinc-500 text-sm">Confira antes de mover as peças.</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <LocationCard label="Origem" name={fromLabel} isCentral={fromIsCentral} />
            <ArrowRight className="h-5 w-5 text-zinc-300" />
            <LocationCard label="Destino" name={toLabel} isCentral={toIsCentral} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Peças" value={totals.pieces} />
            <Stat label="Unidades" value={totals.units} />
            <Stat label="Valor" value={formatCurrency(totals.value)} />
          </div>

          {notes.trim() && (
            <p className="text-sm text-zinc-600">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                Observação
              </span>
              {notes.trim()}
            </p>
          )}

          <p className="flex items-start gap-2 text-xs text-zinc-500 bg-zinc-50 rounded-2xl px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-(--lumilee-gold) shrink-0 mt-0.5" />
            As peças são transferidas todas juntas. Se o estoque de alguma mudou desde a prévia,
            nada é transferido e você gera a prévia de novo.
          </p>

          <div className="flex gap-4 pt-4 border-t border-zinc-50">
            <button
              type="button"
              onClick={onCancel}
              disabled={confirming}
              className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:text-zinc-700 transition-colors border border-zinc-200 rounded-2xl disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirming}
              autoFocus
              className="flex-1 py-4 bg-(--lumilee-gold) text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-orange-100 disabled:opacity-50 disabled:shadow-none"
            >
              {confirming ? 'Transferindo...' : 'Confirmar Transferência'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationCard({
  label,
  name,
  isCentral,
}: {
  label: string;
  name: string;
  isCentral: boolean;
}) {
  const Icon = isCentral ? Home : UserIcon;
  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 min-w-0">
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
        {label}
      </span>
      <span className="flex items-center gap-1.5 mt-1 text-sm font-bold text-zinc-800">
        <Icon className="h-4 w-4 text-zinc-400 shrink-0" />
        <span className="truncate" title={name}>
          {name}
        </span>
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-zinc-100 rounded-2xl px-4 py-3">
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
        {label}
      </span>
      <span className="text-lg font-serif font-medium text-zinc-900">{value}</span>
    </div>
  );
}
