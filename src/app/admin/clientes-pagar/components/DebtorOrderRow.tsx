import { DollarSign, Send } from 'lucide-react';
import { CurrencyInputATM } from '@/components/ui/currency-input-atm';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Debtor, OrderPayment } from '@/lib/services/accounts-receivable.service';
import { PaymentFormState } from './types';

interface DebtorOrderRowProps {
  order: Debtor['orders'][number];
  paymentState: PaymentFormState;
  history: OrderPayment[] | undefined;
  loadingHistory: boolean;
}

export function DebtorOrderRow({ order, paymentState, history, loadingHistory }: DebtorOrderRowProps) {
  const isPaying = paymentState.payingOrderId === order.id;

  return (
    <div className="space-y-2">
      <div className="bg-white p-3 rounded border border-zinc-200 flex justify-between items-center text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div>
            <span className="block text-xs text-zinc-500">Data</span>
            <span className="font-medium">{formatDate(order.date)}</span>
          </div>
          <div>
            <span className="block text-xs text-zinc-500">Valor</span>
            <span className="font-bold text-red-600">{formatCurrency(order.amount)}</span>
          </div>
          <div>
            <span className="block text-xs text-zinc-500">Obs</span>
            <span className="text-zinc-600 truncate max-w-[200px]">{order.notes || '-'}</span>
          </div>
        </div>

        {isPaying ? (
          <div className="flex flex-col md:flex-row items-end md:items-center gap-2 animate-in fade-in bg-green-50 p-2 rounded border border-green-100">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-green-700 uppercase">Valor do Pagamento</label>
              <div className="w-32">
                <CurrencyInputATM
                  autoFocus
                  value={paymentState.paymentAmount}
                  onValueChange={(val) => paymentState.onPaymentAmountChange(val || '')}
                  prefix="R$ "
                  className="w-full border rounded px-2 py-1 text-sm border-green-300 focus:ring-green-300"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-green-700 uppercase">Forma</label>
              <select
                value={paymentState.paymentMethod}
                onChange={(e) => paymentState.onPaymentMethodChange(e.target.value)}
                className="text-sm border rounded px-2 py-1 border-green-300 bg-white"
              >
                <option value="pix">Pix</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  paymentState.onConfirmPayment(order.id);
                }}
                disabled={paymentState.processingPayment}
                className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 text-xs font-bold px-3 transition shadow-sm"
                title="Confirmar Pagamento"
              >
                {paymentState.processingPayment ? (
                  '...'
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Confirmar
                  </>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  paymentState.onCancelPayment();
                }}
                className="text-zinc-500 hover:text-zinc-700 text-xs font-medium px-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              paymentState.onStartPayment(order.id, order.amount);
            }}
            className="text-green-600 hover:text-green-800 font-medium text-xs border border-green-200 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100 transition flex items-center gap-1 shadow-sm"
          >
            <DollarSign className="h-3 w-3" /> Pagar
          </button>
        )}
      </div>

      {/* Payment History Log */}
      {history && history.length > 0 && (
        <div className="ml-4 border-l-2 border-zinc-200 pl-4 py-2 space-y-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Histórico de Recebimentos
          </p>
          {history.map((pay) => (
            <div
              key={pay.id}
              className="flex items-center justify-between text-xs text-zinc-600 bg-zinc-100/50 p-2 rounded"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-green-700">{formatCurrency(pay.amount)}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-500 uppercase font-bold text-[9px]">
                  {pay.payment_method}
                </span>
                <span className="text-zinc-400 italic">por {pay.receiver_name}</span>
              </div>
              <span className="text-zinc-400">{formatDate(pay.created_at)}</span>
            </div>
          ))}
        </div>
      )}
      {loadingHistory && (
        <div className="ml-4 py-1 text-[10px] text-zinc-400 animate-pulse">Carregando histórico...</div>
      )}
    </div>
  );
}
