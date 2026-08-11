import { CreditCard, DollarSign, History, X } from 'lucide-react';
import { Order } from '@/lib/services/orders.service';
import { OrderPayment } from '@/lib/services/accounts-receivable.service';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface PaymentInfoSectionProps {
  order: Order;
  paymentMethodLabels: Record<string, string>;
  paymentStatusLabels: Record<string, string>;
  payments: OrderPayment[];
  loadingPayments: boolean;

  isPaying: boolean;
  onStartPaying: () => void;
  onCancelPaying: () => void;
  payAmount: number;
  onPayAmountChange: (value: number) => void;
  payMethod: string;
  onPayMethodChange: (value: string) => void;
  isSubmittingPay: boolean;
  onSubmitPayment: () => void;
}

export function PaymentInfoSection({
  order,
  paymentMethodLabels,
  paymentStatusLabels,
  payments,
  loadingPayments,
  isPaying,
  onStartPaying,
  onCancelPaying,
  payAmount,
  onPayAmountChange,
  payMethod,
  onPayMethodChange,
  isSubmittingPay,
  onSubmitPayment,
}: PaymentInfoSectionProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-[var(--lumike-gold)]" /> Pagamento
      </h3>
      <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Método:</span>
          <span className="font-medium">
            {paymentMethodLabels[order.payment_method || ''] || order.payment_method}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Status:</span>
          <span
            className={`font-medium ${order.payment_status === 'pago' ? 'text-green-600' : 'text-amber-600'}`}
          >
            {paymentStatusLabels[order.payment_status || ''] || order.payment_status}
          </span>
        </div>
        {order.payment_status !== 'pago' ? (
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Valor Recebido:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(order.total_amount - (order.boca_value ?? order.total_amount))}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-zinc-100 pt-1">
              <span className="text-zinc-900">Saldo Devedor:</span>
              <span className="text-red-600">{formatCurrency(order.boca_value ?? order.total_amount)}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between text-sm pt-1 border-t border-zinc-200">
            <span className="text-zinc-500">Valor Total Pago:</span>
            <span className="font-bold text-green-600">{formatCurrency(order.total_amount)}</span>
          </div>
        )}
      </div>

      {!isPaying && order.payment_status !== 'pago' && (
        <button
          onClick={onStartPaying}
          className="w-full mt-2 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition flex items-center justify-center gap-1 shadow-sm"
        >
          <DollarSign className="h-3.5 w-3.5" /> Registrar Recebimento
        </button>
      )}

      {isPaying && (
        <div className="mt-2 p-3 bg-white border border-green-200 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-1 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-green-800 uppercase tracking-wider">
              Novo Recebimento
            </span>
            <button onClick={onCancelPaying} className="text-zinc-400 hover:text-red-500 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase">Valor</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => onPayAmountChange(Number(e.target.value))}
                className="w-full border border-zinc-200 rounded p-1.5 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase">Método</label>
              <select
                value={payMethod}
                onChange={(e) => onPayMethodChange(e.target.value)}
                className="w-full border border-zinc-200 rounded p-1.5 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none bg-zinc-50"
              >
                <option value="dinheiro">💵 Dinheiro</option>
                <option value="pix">💎 PIX</option>
                <option value="cartao">💳 Cartão</option>
              </select>
            </div>
          </div>
          <button
            onClick={onSubmitPayment}
            disabled={isSubmittingPay}
            className="w-full py-2 bg-green-600 text-white rounded-lg font-bold text-xs hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
          >
            {isSubmittingPay ? 'Registrando...' : 'Confirmar Recebimento'}
          </button>
        </div>
      )}

      {/* Payment History Log */}
      {payments.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <History className="h-3 w-3" /> Histórico de Recebimentos
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center text-[10px] bg-zinc-50 p-2 rounded border border-zinc-100"
              >
                <div>
                  <span className="font-bold text-green-600">{formatCurrency(p.amount)}</span>
                  <span className="text-zinc-400 mx-1">•</span>
                  <span className="uppercase text-zinc-500">{p.payment_method}</span>
                  <span className="text-zinc-400 italic ml-1">por {p.receiver_name}</span>
                </div>
                <span className="text-zinc-400">{formatDate(p.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {loadingPayments && payments.length === 0 && (
        <div className="mt-4 animate-pulse text-[10px] text-zinc-400">Carregando histórico...</div>
      )}
    </section>
  );
}
