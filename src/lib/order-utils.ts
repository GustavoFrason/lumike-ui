import { Order } from '@/lib/services/orders.service';

export interface OrderPaymentBreakdown {
  isPaid: boolean;
  saldo: number;
  valorPago: number;
}

/**
 * Calcula quanto de um pedido já foi pago e quanto ainda está em aberto
 * (fiado/boca), a partir dos mesmos critérios usados em toda a tela de
 * vendas (lista, KPIs e colunas da tabela).
 */
export function getOrderPaymentBreakdown(order: Order): OrderPaymentBreakdown {
  const isPaid =
    order.payment_status === 'pago' ||
    order.status === 'paid' ||
    (order.status === 'completed' && !order.boca_value);
  const saldo = isPaid ? 0 : Number(order.boca_value ?? order.total_amount ?? 0);
  const valorPago = Math.max(0, Number(order.total_amount || 0) - saldo);

  return { isPaid, saldo, valorPago };
}
