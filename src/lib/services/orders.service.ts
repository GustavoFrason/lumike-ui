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
  notes?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  items?: OrderItem[];
}

export interface CreateOrderItemDto {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderDto {
  customer_id?: number;
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
  };
  items: CreateOrderItemDto[];
}

export const ordersService = {
  /**
   * Lista todos os pedidos
   */
  async getAll(
    page = 1,
    limit = 50,
    status?: string,
    customerId?: number,
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

    const { data } = await api.get<PaginatedResponse<Order>>(`/pedidos?${params.toString()}`);
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
   * Remove um pedido
   */
  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/pedidos/${id}`);
    return data;
  },
};
