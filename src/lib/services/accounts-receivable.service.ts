'use client';

import { api } from '../api';

export interface DebtOrder {
  id: number;
  date: string;
  amount: number;
  method: string;
  notes?: string;
}

export interface Debtor {
  customer_id: number;
  customer_name: string;
  customer_phone?: string;
  total_debt: number;
  orders_count: number;
  orders: DebtOrder[];
}

export interface OrderPayment {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  received_by_user_id: number | null;
  receiver_name: string | null;
  created_at: string;
  type: 'payment' | 'refund';
  notes: string | null;
}

export const accountsReceivableService = {
  async getDebtors(): Promise<Debtor[]> {
    const { data } = await api.get<Debtor[]>('/accounts-receivable');
    return data;
  },

  async getOrderPayments(orderId: number): Promise<OrderPayment[]> {
    const { data } = await api.get<OrderPayment[]>(`/accounts-receivable/history/${orderId}`);
    return data;
  },

  async markAsPaid(
    orderId: number,
    amount: number,
    paymentMethod: string,
  ): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(`/accounts-receivable/pay/${orderId}`, {
      amount,
      payment_method: paymentMethod,
    });
    return data;
  },
};
