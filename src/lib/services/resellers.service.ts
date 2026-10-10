/**
 * Resellers Service
 * --------------------
 * Acerto com revendedora. Regra: ela recebe dos clientes, fica com a
 * comissão e repassa à loja o resto (recebido − comissão).
 */

import { api } from '../api';

export interface ResellerListItem {
  id: number;
  name: string;
  is_active: boolean;
  commission_rate: number;
  stock_pieces: number;
  stock_value: number;
  unsettled_orders: number;
  /** A repassar das vendas não acertadas + saldo anterior (negativo = loja deve a ela). */
  balance_to_pay: number;
  last_settlement_at: string | null;
}

export interface StatementOrder {
  id: number;
  created_at: string;
  customer_name: string | null;
  total: number;
  pieces: number;
  /** Saiu da mala dela (o dinheiro está com ela). */
  from_her_stock: boolean;
  /** Ela é a vendedora (entra na comissão). */
  is_her_sale: boolean;
}

export interface StatementTotals {
  orders_count: number;
  pieces: number;
  collected: number;
  commission_base: number;
  commission: number;
  amount_due: number;
}

export interface ResellerStatement {
  reseller: { id: number; name: string; is_active: boolean; commission_rate: number };
  period: { start: string | null; end: string };
  orders: StatementOrder[];
  totals: StatementTotals;
  previous_balance: number;
  balance_to_pay: number;
  transfers: {
    sent_pieces: number;
    sent_value: number;
    returned_pieces: number;
    returned_value: number;
  };
  current_stock: {
    pieces: number;
    value: number;
    items: {
      product_id: number;
      name: string;
      sku: string | null;
      quantity: number;
      price: number;
    }[];
  };
  last_settlement: { id: number; period_end: string; created_at: string } | null;
}

export interface Settlement {
  id: number;
  period_start: string | null;
  period_end: string;
  orders_count: number;
  pieces_count: number;
  sales_total: number;
  commission_rate: number;
  commission_amount: number;
  amount_due: number;
  amount_paid: number;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateSettlementInput {
  period_start?: string;
  period_end: string;
  order_ids: number[];
  /** Positivo = ela pagou à loja; negativo = a loja pagou a ela. */
  amount_paid: number;
  /** "A repassar" mostrado na tela — se mudou, a API recusa (409). */
  expected_amount_due: number;
  payment_method?: string;
  notes?: string;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Mesma conta da API para as vendas marcadas na tela: recebido (da mala
 * dela), comissão (taxa × vendas dela) e a repassar.
 */
export function computeSelectedTotals(
  orders: StatementOrder[],
  commissionRate: number,
): StatementTotals {
  const collected = round2(orders.filter((o) => o.from_her_stock).reduce((s, o) => s + o.total, 0));
  const commissionBase = round2(
    orders.filter((o) => o.is_her_sale).reduce((s, o) => s + o.total, 0),
  );
  const commission = round2((commissionBase * commissionRate) / 100);
  return {
    orders_count: orders.length,
    pieces: orders.reduce((s, o) => s + o.pieces, 0),
    collected,
    commission_base: commissionBase,
    commission,
    amount_due: round2(collected - commission),
  };
}

export const resellersService = {
  async list(): Promise<ResellerListItem[]> {
    const { data } = await api.get<ResellerListItem[]>('/resellers');
    return data;
  },

  async getStatement(id: number, periodStart?: string, periodEnd?: string) {
    const params = new URLSearchParams();
    if (periodStart) params.append('period_start', periodStart);
    if (periodEnd) params.append('period_end', periodEnd);
    const query = params.toString();
    const { data } = await api.get<ResellerStatement>(
      `/resellers/${id}/statement${query ? `?${query}` : ''}`,
    );
    return data;
  },

  async listSettlements(id: number): Promise<Settlement[]> {
    const { data } = await api.get<Settlement[]>(`/resellers/${id}/settlements`);
    return data;
  },

  async createSettlement(id: number, input: CreateSettlementInput): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>(`/resellers/${id}/settlements`, input);
    return data;
  },
};
