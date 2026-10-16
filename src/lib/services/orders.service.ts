/**
 * Orders Service
 * --------------------
 * Serviço para operações com pedidos/vendas.
 */

import { api, type PaginatedResponse } from '../api';

export type { PaginatedResponse };

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: {
    id: number;
    name: string;
    sku?: string;
  };
}

export interface Order {
  id: number;
  customer_id?: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  payment_method?: string;
  payment_status?: string;
  total_amount: number;
  boca_value?: number;
  boca_paid_now?: number;
  seller_id?: number;
  stock_location_user_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  /** Vendedora que recebe a comissão (null = venda da loja). */
  seller?: { id: number; name: string } | null;
  /** De qual mala o estoque saiu (null = Estoque Central). */
  stock_location?: { id: number; name: string } | null;
  items?: OrderItem[];
}

/** Filtros extras da lista/resumo de vendas. */
export interface OrderFilters {
  /** Id da vendedora, ou 'none' para vendas da loja (sem vendedora). */
  sellerId?: number | 'none';
  /** Id da revendedora de cuja mala o estoque saiu, ou 'central'. */
  stockLocation?: number | 'central';
  /** Dias do calendário ('YYYY-MM-DD'), inclusive. */
  dateFrom?: string;
  dateTo?: string;
}

export interface SellerSummary {
  /** null = Loja (sem vendedora ou vendida pela gestão). */
  seller_id: number | null;
  name: string;
  orders_count: number;
  total: number;
  commission_rate: number;
  commission: number;
}

export interface StockLocationSummary {
  /** null = Estoque Central. */
  user_id: number | null;
  name: string;
  orders_count: number;
  total: number;
}

export interface OrdersSummary {
  totals: { orders_count: number; total: number; commission: number };
  by_seller: SellerSummary[];
  by_stock_location: StockLocationSummary[];
}

function appendOrderFilters(params: URLSearchParams, filters: OrderFilters = {}) {
  if (filters.sellerId !== undefined) params.append('seller_id', String(filters.sellerId));
  if (filters.stockLocation !== undefined)
    params.append('stock_location', String(filters.stockLocation));
  if (filters.dateFrom) params.append('date_from', filters.dateFrom);
  if (filters.dateTo) params.append('date_to', filters.dateTo);
}

export interface CreateOrderItemDto {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderDto {
  customer_id?: number;
  /** Quem recebe a comissão — não afeta de onde o estoque sai. */
  seller_id?: number;
  /** De qual localidade o estoque desta venda é descontado. undefined = Estoque Central. */
  stock_location_user_id?: number;
  notes?: string;
  payment_method: 'dinheiro' | 'cartao' | 'parcelado' | 'boca' | 'aberto';
  payment_status: 'pago' | 'parcial' | 'aberto';
  boca_details?: {
    value: number;
    paid_now?: number;
    notes?: string;
  };
  card_details?: {
    brand?: string;
    tax?: number;
    transaction_id?: string;
    /** Só no modo "parcelado" — número de parcelas (1 a 10, mínimo R$50/parcela). */
    installments?: number;
  };
  items: CreateOrderItemDto[];
  /**
   * Data da venda ('YYYY-MM-DD') para lançar depois uma venda já feita —
   * só admin/gestor. Ausente = agora.
   */
  sale_date?: string;
}

export const ordersService = {
  /**
   * Lista os pedidos (a revendedora logada recebe só os dela).
   */
  async getAll(
    page = 1,
    limit = 50,
    status?: string,
    customerId?: number,
    filters?: OrderFilters,
  ): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append('status', status);
    }
    if (customerId) {
      params.append('customer_id', customerId.toString());
    }
    appendOrderFilters(params, filters);

    const { data } = await api.get<PaginatedResponse<Order>>(`/pedidos?${params.toString()}`);
    return data;
  },

  /**
   * Totais por vendedora (com comissão) e por estoque de origem no período,
   * sem canceladas — calculado no servidor sobre todas as vendas.
   */
  async getSummary(filters: OrderFilters = {}): Promise<OrdersSummary> {
    const params = new URLSearchParams();
    appendOrderFilters(params, filters);
    const query = params.toString();
    const { data } = await api.get<OrdersSummary>(`/pedidos/summary${query ? `?${query}` : ''}`);
    return data;
  },

  /**
   * Busca um pedido por ID
   */
  async getById(id: number): Promise<Order> {
    const { data } = await api.get<Order>(`/pedidos/${id}`);
    return data;
  },

  /**
   * Cria um novo pedido
   */
  async create(order: CreateOrderDto): Promise<Order> {
    const { data } = await api.post<Order>('/pedidos', order);
    return data;
  },

  /**
   * Atualiza o status de um pedido
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    const { data } = await api.patch<Order>(`/pedidos/${id}/status`, { status });
    return data;
  },

  /**
   * Cancela uma venda: devolve o estoque e registra o estorno no caixa
   * (fn_cancel_order no backend).
   */
  async cancel(id: number, input: { refundAmount: number; notes?: string }): Promise<Order> {
    const { data } = await api.post<Order>(`/pedidos/${id}/cancel`, input);
    return data;
  },

  /**
   * Remove um pedido
   */
  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/pedidos/${id}`);
    return data;
  },
};
