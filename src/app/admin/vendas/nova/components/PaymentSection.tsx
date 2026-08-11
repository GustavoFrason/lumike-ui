import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { CurrencyInputATM } from '@/components/ui/currency-input-atm';
import { Customer } from '@/lib/services/customers.service';
import { PaymentMethod, PaymentStatus } from './types';

interface PaymentSectionProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  paymentStatus: PaymentStatus;
  onPaymentStatusChange: (status: PaymentStatus) => void;

  bocaValue: string;
  onBocaValueChange: (value: string) => void;
  bocaPaidNow: string;
  onBocaPaidNowChange: (value: string) => void;
  bocaNotes: string;
  onBocaNotesChange: (value: string) => void;
  selectedCustomer: Customer | null;

  cardBrand: string;
  onCardBrandChange: (value: string) => void;
  transactionId: string;
  onTransactionIdChange: (value: string) => void;
  cardTax: string;
  onCardTaxChange: (value: string) => void;

  notes: string;
  onNotesChange: (value: string) => void;
}

export function PaymentSection({
  paymentMethod,
  onPaymentMethodChange,
  paymentStatus,
  onPaymentStatusChange,
  bocaValue,
  onBocaValueChange,
  bocaPaidNow,
  onBocaPaidNowChange,
  bocaNotes,
  onBocaNotesChange,
  selectedCustomer,
  cardBrand,
  onCardBrandChange,
  transactionId,
  onTransactionIdChange,
  cardTax,
  onCardTaxChange,
  notes,
  onNotesChange,
}: PaymentSectionProps) {
  const isFixedPayment =
    paymentMethod === 'dinheiro' || paymentMethod === 'cartao' || paymentMethod === 'parcelado';

  return (
    <>
      {/* Pagamento */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 mb-1 block">Método</label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
              className="w-full border rounded p-2 text-sm bg-zinc-50 font-medium"
            >
              <option value="dinheiro">💵 Dinheiro</option>
              <option value="cartao">💳 Cartão</option>
              <option value="parcelado">📅 Parcelado</option>
              <option value="boca">👄 Boca (Fiado)</option>
              <option value="aberto">⏳ Em Aberto</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 mb-1 block">Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => onPaymentStatusChange(e.target.value as PaymentStatus)}
              disabled={isFixedPayment}
              className={`w-full border rounded p-2 text-sm font-medium ${
                isFixedPayment
                  ? 'bg-green-50 text-green-700 border-green-200 cursor-not-allowed'
                  : paymentStatus === 'pago'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : paymentStatus === 'parcial'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {/* Dinheiro, Cartão e Parcelado: apenas "Completo" */}
              {isFixedPayment && <option value="pago">✓ Completo (Pago)</option>}

              {/* Boca e Aberto: apenas "Parcial" e "Pendente" */}
              {(paymentMethod === 'boca' || paymentMethod === 'aberto') && (
                <>
                  <option value="parcial">Parcial</option>
                  <option value="aberto">Pendente</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Detalhes Boca */}
      {paymentMethod === 'boca' && (
        <div className="bg-amber-50 p-3 rounded border border-amber-200 space-y-2 animate-in slide-in-from-top-2">
          <p className="text-xs font-bold text-amber-800 uppercase">Detalhes do Fiado</p>

          {/* Se for pagamento parcial, mostrar campo "Pago Agora" */}
          {paymentStatus === 'parcial' && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-amber-700 font-medium block mb-1">
                  💰 Valor Pago Agora
                </label>
                <CurrencyInputATM
                  placeholder="Quanto o cliente pagou agora?"
                  value={bocaPaidNow}
                  onValueChange={(val) => onBocaPaidNowChange(val || '')}
                  prefix="R$ "
                  className="w-full border border-green-300 rounded p-2 text-sm bg-white"
                />
                <p className="text-xs text-amber-600 mt-1">Este valor entrará no caixa como recebido</p>
              </div>
              <div>
                <label className="text-xs text-amber-700 font-medium block mb-1">
                  📋 Valor Pendente (Calculado)
                </label>
                <CurrencyInputATM
                  value={bocaValue}
                  onValueChange={(val) => onBocaValueChange(val || '')}
                  prefix="R$ "
                  className="w-full border rounded p-2 text-sm bg-amber-100"
                  disabled
                />
              </div>
            </div>
          )}

          {/* Se for pendente total, mostrar apenas valor pendente */}
          {paymentStatus === 'aberto' && (
            <CurrencyInputATM
              placeholder="Valor Pendente"
              value={bocaValue}
              onValueChange={(val) => onBocaValueChange(val || '')}
              prefix="R$ "
              className="w-full border rounded p-2 text-sm"
              disabled
            />
          )}

          <input
            type="text"
            placeholder="Obs (Ex: Paga dia 15)"
            value={bocaNotes}
            onChange={(e) => onBocaNotesChange(e.target.value)}
            className="w-full border rounded p-2 text-sm"
          />
          {selectedCustomer && (
            <Link
              href="/admin/clientes-pagar"
              target="_blank"
              className="text-xs text-amber-700 hover:underline flex items-center gap-1"
            >
              <Wallet className="h-3 w-3" />
              Ver Histórico de Débitos
            </Link>
          )}
        </div>
      )}

      {/* Detalhes Cartão */}
      {(paymentMethod === 'cartao' || paymentMethod === 'parcelado') && (
        <div className="bg-zinc-50 p-3 rounded border border-zinc-200 space-y-2 animate-in slide-in-from-top-2">
          <p className="text-xs font-bold text-zinc-500 uppercase">Detalhes da Maquininha</p>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={cardBrand}
              onChange={(e) => onCardBrandChange(e.target.value)}
              className="border rounded p-2 text-sm"
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Master</option>
              <option value="elo">Elo</option>
              <option value="amex">Amex</option>
              <option value="hiper">Hiper</option>
            </select>
            <CurrencyInputATM
              placeholder="Taxa (R$)"
              value={cardTax}
              onValueChange={(val) => onCardTaxChange(val || '')}
              prefix="R$ "
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          <input
            type="text"
            placeholder="ID Transação / NSU"
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
            className="w-full border rounded p-2 text-sm font-mono uppercase"
          />
        </div>
      )}

      <div>
        <label className="text-xs font-semibold uppercase text-zinc-500 mb-1 block">
          Observações da Venda
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
          placeholder="..."
        />
      </div>
    </>
  );
}
