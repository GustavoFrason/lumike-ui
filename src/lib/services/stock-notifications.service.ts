/**
 * Stock Notifications Service
 * --------------------
 * Alertas "avise-me quando voltar ao estoque". Passa pelas rotas
 * /api/stock-notifications (cookie httpOnly) — o backend identifica o
 * usuário pelo JWT, nunca por um user_id enviado pelo front.
 */

import { api } from '../api';
import { Product } from './products.service';

export interface StockAlert {
  id: number;
  product_id: number;
  status: string;
  created_at: string;
  product: Product | null;
}

export const stockNotificationsService = {
  /**
   * Cria um alerta. Logado: o e-mail vem da sessão no backend.
   * Visitante: informe `email`.
   */
  async create(input: { product_id: number; variant_id?: number; email?: string }) {
    const { data } = await api.post<{ id?: number; message: string }>(
      '/stock-notifications',
      input,
    );
    return data;
  },

  /** Alertas do usuário logado. */
  async getMyAlerts(): Promise<StockAlert[]> {
    const { data } = await api.get<StockAlert[]>('/stock-notifications/my-alerts');
    return data;
  },
};
