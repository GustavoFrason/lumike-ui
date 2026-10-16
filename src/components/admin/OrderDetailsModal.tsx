'use client';

import { useState, useEffect } from 'react';
import { Order, OrderItem, ordersService } from '@/lib/services/orders.service';
import { getErrorMessage } from '@/lib/utils';
import {
  accountsReceivableService,
  OrderPayment,
} from '@/lib/services/accounts-receivable.service';
import { WarrantyModal } from '@/app/admin/garantias/WarrantyModal';
import { OrderHeader } from './order-details/OrderHeader';
import { CustomerInfoSection } from './order-details/CustomerInfoSection';
import { PaymentInfoSection } from './order-details/PaymentInfoSection';
import { OrderItemsTable } from './order-details/OrderItemsTable';
import { CancelOrderFooter } from './order-details/CancelOrderFooter';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { notify } from '@/components/ui/notify';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  /** Venda cancelada ou recebimento registrado: a lista recarrega. */
  onChanged: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Análise/Pendente',
  paid: 'Pago',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  parcelado_boca: 'Parcelado Boca',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pago: 'Totalmente Pago',
  parcial: 'Pagamento Parcial',
  aberto: 'Pendente',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  dinheiro: '💵 Dinheiro',
  cartao: '💳 Cartão',
  parcelado: '📅 Parcelado',
  boca: '👄 Boca (Fiado)',
  aberto: '⚪ Em Aberto',
  estorno: '↩️ Estorno/Devolução',
};

const STATUS_COLORS: Record<string, 'pending' | 'active' | 'completed' | 'cancelled'> = {
  pending: 'pending',
  paid: 'completed',
  completed: 'completed',
  cancelled: 'cancelled',
  parcelado_boca: 'active',
};

export function OrderDetailsModal({ order, onClose, onChanged }: OrderDetailsModalProps) {
  const { confirm, confirmDialog } = useConfirm();
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [cancelNotes, setCancelNotes] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [repairProduct, setRepairProduct] = useState<OrderItem['products'] | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('dinheiro');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  useEffect(() => {
    if (order.id) {
      setLoadingPayments(true);
      accountsReceivableService
        .getOrderPayments(order.id)
        .then(setPayments)
        .catch((err) => console.error('Erro ao carregar pagamentos:', err))
        .finally(() => setLoadingPayments(false));
    }
  }, [order.id]);

  const totalRecebido = order.total_amount - (order.boca_value ?? order.total_amount);

  async function handleCancelOrder() {
    const ok = await confirm({
      title: 'Cancelar esta venda?',
      description: 'Esta ação é irreversível.',
      confirmLabel: 'Cancelar venda',
      cancelLabel: 'Voltar',
      destructive: true,
    });
    if (!ok) return;
    setSubmittingCancel(true);
    try {
      // Via service (axios): erro do backend agora vira exceção. Antes o
      // fetch cru não checava response.ok e sempre dizia "sucesso".
      await ordersService.cancel(order.id, { refundAmount, notes: cancelNotes });
      notify.success('Venda cancelada com sucesso!');
      onChanged();
    } catch (error) {
      console.error(error);
      notify.error(`Erro ao cancelar venda: ${getErrorMessage(error)}`);
    } finally {
      setSubmittingCancel(false);
    }
  }

  async function handleSubmitPayment() {
    setIsSubmittingPay(true);
    try {
      await accountsReceivableService.markAsPaid(order.id, payAmount, payMethod);
      notify.success('Recebimento registrado com sucesso!');
      onChanged();
    } catch (err) {
      console.error(err);
      notify.error(getErrorMessage(err, 'Erro ao registrar recebimento.'));
    } finally {
      setIsSubmittingPay(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <OrderHeader
          order={order}
          statusLabels={STATUS_LABELS}
          statusColors={STATUS_COLORS}
          onClose={onClose}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomerInfoSection order={order} />

            <PaymentInfoSection
              order={order}
              paymentMethodLabels={PAYMENT_METHOD_LABELS}
              paymentStatusLabels={PAYMENT_STATUS_LABELS}
              payments={payments}
              loadingPayments={loadingPayments}
              isPaying={isPaying}
              onStartPaying={() => {
                setIsPaying(true);
                setPayAmount(order.boca_value ?? order.total_amount);
              }}
              onCancelPaying={() => setIsPaying(false)}
              payAmount={payAmount}
              onPayAmountChange={setPayAmount}
              payMethod={payMethod}
              onPayMethodChange={setPayMethod}
              isSubmittingPay={isSubmittingPay}
              onSubmitPayment={handleSubmitPayment}
            />
          </div>

          <OrderItemsTable order={order} onRepair={setRepairProduct} />

          {order.notes && (
            <section>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-2">
                Observações
              </h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                {order.notes}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-4">
          <CancelOrderFooter
            order={order}
            onClose={onClose}
            isCancelling={isCancelling}
            onStartCancelling={() => setIsCancelling(true)}
            onStopCancelling={() => setIsCancelling(false)}
            refundAmount={refundAmount}
            onRefundAmountChange={setRefundAmount}
            totalRecebido={totalRecebido}
            cancelNotes={cancelNotes}
            onCancelNotesChange={setCancelNotes}
            submittingCancel={submittingCancel}
            onConfirmCancel={handleCancelOrder}
          />
        </div>
      </div>

      {repairProduct && (
        <WarrantyModal
          initialData={{
            customer_id: order.customer_id,
            order_id: order.id,
            product_id: repairProduct.id,
            origin: 'sold',
          }}
          onClose={() => setRepairProduct(null)}
          onSave={() => {
            notify.success('Concerto registrado com sucesso!');
            setRepairProduct(null);
          }}
        />
      )}
      {confirmDialog}
    </div>
  );
}
