'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  accountsReceivableService,
  Debtor,
  OrderPayment,
} from '@/lib/services/accounts-receivable.service';
import { Loading } from '@/components/ui/loading';
import { formatCurrency, parseCurrencyBR } from '@/lib/formatters';
import { DebtorCard } from './components/DebtorCard';

export default function AccountsReceivablePage() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null);

  // Payment State
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [processingPayment, setProcessingPayment] = useState(false);

  // History State
  const [paymentHistory, setPaymentHistory] = useState<Record<number, OrderPayment[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<number, boolean>>({});

  const loadDebtors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountsReceivableService.getDebtors();
      setDebtors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = async (orderId: number) => {
    setLoadingHistory((prev) => ({ ...prev, [orderId]: true }));
    try {
      const history = await accountsReceivableService.getOrderPayments(orderId);
      setPaymentHistory((prev) => ({ ...prev, [orderId]: history }));
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoadingHistory((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  useEffect(() => {
    loadDebtors();
  }, [loadDebtors]);

  function toggleExpand(customerId: number) {
    if (expandedCustomer !== customerId) {
      const debtor = debtors.find((d) => d.customer_id === customerId);
      debtor?.orders.forEach((order) => {
        if (!paymentHistory[order.id]) {
          fetchHistory(order.id);
        }
      });
    }
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  }

  function startPayment(orderId: number, amount: number) {
    setPayingOrderId(orderId);
    setPaymentAmount(amount.toString().replace('.', ','));
    setPaymentMethod('pix');
  }

  async function handlePayment(orderId: number) {
    if (!paymentAmount) return;
    setProcessingPayment(true);
    try {
      const numericAmount = parseCurrencyBR(paymentAmount);
      await accountsReceivableService.markAsPaid(orderId, numericAmount, paymentMethod);
      await loadDebtors();
      await fetchHistory(orderId);
      setPayingOrderId(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar pagamento');
    } finally {
      setProcessingPayment(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-playfair">Contas a Receber (Fiado/Aberto)</h1>
        <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg font-medium border border-red-100">
          Total a Receber: {formatCurrency(debtors.reduce((sum, d) => sum + d.total_debt, 0))}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : debtors.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 bg-white rounded-lg border border-dashed">
          Nenhum débito em aberto encontrado.
        </div>
      ) : (
        <div className="space-y-4">
          {debtors.map((debtor) => (
            <DebtorCard
              key={debtor.customer_id}
              debtor={debtor}
              isExpanded={expandedCustomer === debtor.customer_id}
              onToggleExpand={() => toggleExpand(debtor.customer_id)}
              paymentState={{
                payingOrderId,
                paymentAmount,
                onPaymentAmountChange: setPaymentAmount,
                paymentMethod,
                onPaymentMethodChange: setPaymentMethod,
                processingPayment,
                onStartPayment: startPayment,
                onCancelPayment: () => setPayingOrderId(null),
                onConfirmPayment: handlePayment,
              }}
              paymentHistory={paymentHistory}
              loadingHistory={loadingHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
