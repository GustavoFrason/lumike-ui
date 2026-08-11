import { X } from 'lucide-react';
import { Order } from '@/lib/services/orders.service';

interface CancelOrderFooterProps {
  order: Order;
  onClose: () => void;

  isCancelling: boolean;
  onStartCancelling: () => void;
  onStopCancelling: () => void;

  refundAmount: number;
  onRefundAmountChange: (value: number) => void;
  totalRecebido: number;

  cancelNotes: string;
  onCancelNotesChange: (value: string) => void;

  submittingCancel: boolean;
  onConfirmCancel: () => void;
}

export function CancelOrderFooter({
  order,
  onClose,
  isCancelling,
  onStartCancelling,
  onStopCancelling,
  refundAmount,
  onRefundAmountChange,
  totalRecebido,
  cancelNotes,
  onCancelNotesChange,
  submittingCancel,
  onConfirmCancel,
}: CancelOrderFooterProps) {
  if (order.status === 'cancelled') {
    return (
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition font-medium"
        >
          Fechar
        </button>
      </div>
    );
  }

  if (!isCancelling) {
    return (
      <div className="flex justify-between items-center w-full">
        <button
          onClick={onStartCancelling}
          className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
        >
          <X className="h-4 w-4" /> Cancelar Venda
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition font-medium"
        >
          Fechar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-4">
      <h4 className="font-bold text-red-900 text-sm">Configuração de Cancelamento</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-red-700 uppercase mb-1">
            Valor a Devolver (Estorno)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-red-400">R$</span>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => onRefundAmountChange(Number(e.target.value))}
              max={totalRecebido}
              className="w-full pl-9 pr-4 py-2 border border-red-200 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="0.00"
            />
          </div>
          <p className="text-[10px] text-red-500 mt-1">
            Máximo disponível: R$ {totalRecebido.toFixed(2)}
          </p>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-red-700 uppercase mb-1">
            Motivo / Notas
          </label>
          <textarea
            value={cancelNotes}
            onChange={(e) => onCancelNotesChange(e.target.value)}
            className="w-full px-4 py-2 border border-red-200 rounded-md text-sm"
            placeholder="Ex: Cliente desistiu, devolvido com multa..."
            rows={2}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onStopCancelling}
          className="px-4 py-2 text-zinc-600 hover:text-zinc-900 text-sm font-medium"
        >
          Voltar
        </button>
        <button
          onClick={onConfirmCancel}
          disabled={submittingCancel}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2"
        >
          {submittingCancel ? 'Processando...' : 'Confirmar Cancelamento'}
        </button>
      </div>
    </div>
  );
}
