/**
 * Dashboard Service
 * --------------------
 * Serviço para dados do dashboard.
 */

import { api } from '../api';

export interface DashboardKPIs {
  total_vendas: number;
  total_pedidos: number;
  produtos_ativos: number;
  clientes: number;
  total_leads: number;
  ticket_medio: number;
  taxa_conversao: number;
}

export interface TopSeller {
  product_id: number;
  name: string;
  qty_90d: number;
}

export interface LowStockAlert {
  product_id: number;
  product_name: string;
  sku?: string;
  current_stock: number;
  min_stock: number;
  missing: number;
}

export const dashboardService = {
  /**
   * Busca KPIs do dashboard
   */
  async getKPIs(): Promise<DashboardKPIs> {
    const { data } = await api.get<DashboardKPIs>('/dashboard/kpis');
    return data;
  },

  /**
   * Busca produtos mais vendidos
   */
  async getTopSellers(limit: number = 5): Promise<TopSeller[]> {
    const { data } = await api.get<TopSeller[]>(`/dashboard/top-sellers?limit=${limit}`);
    return data;
  },

  /**
   * Busca alertas de estoque baixo
   */
  async getLowStockAlerts(limit: number = 10): Promise<LowStockAlert[]> {
    const { data } = await api.get<LowStockAlert[]>(`/dashboard/low-stock?limit=${limit}`);
    return data;
  },

  /**
   * Busca histórico de faturamento
   */
  async getRevenueHistory(): Promise<{ date: string; revenue: number }[]> {
    const { data } = await api.get<{ date: string; revenue: number }[]>(
      '/dashboard/revenue-history',
    );
    return data;
  },
};
