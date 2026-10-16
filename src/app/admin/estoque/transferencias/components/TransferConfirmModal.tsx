import { AlertTriangle, ArrowRight, Home, Package, User as UserIcon } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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

/** Confirmação da transferência em lote, no visual padrão dos diálogos do painel. */
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
    <ConfirmDialog
      title="Confirmar Transferência"
      description="Confira antes de mover as peças."
      icon={Package}
      confirmLabel="Confirmar Transferência"
      loadingLabel="Transferindo..."
      loading={confirming}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
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
        As peças são transferidas todas juntas. Se o estoque de alguma mudou desde a prévia, nada é
        transferido e você gera a prévia de novo.
      </p>
    </ConfirmDialog>
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
