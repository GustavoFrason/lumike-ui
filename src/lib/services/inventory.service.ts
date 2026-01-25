/**
 * Inventory Service
 * --------------------
 * Serviço para gestão de estoque.
 */

import { api } from '../api';

export interface StockMovement {
  id: number;
  product_id: number;
  movement: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reference?: string;
  created_at: string;
}

export interface StockEntryDto {
  quantity: number;
  reference?: string;
}

export interface StockExitDto {
  quantity: number;
  reference?: string;
}

export interface StockInfo {
  produto_id: number;
  quantidade: number;
  updated_at: string;
}

export const inventoryService = {
  /**
   * Registra entrada de estoque
   */
  async addStock(productId: number, dto: StockEntryDto) {
    const { data } = await api.post(`/inventory/products/${productId}/entry`, dto);
    return data;
  },

  /**
   * Registra saída de estoque
   */
  async removeStock(productId: number, dto: StockExitDto) {
    const { data } = await api.post(`/inventory/products/${productId}/exit`, dto);
    return data;
  },

  /**
   * Obtém histórico de movimentações
   */
  async getHistory(productId: number, limit: number = 50): Promise<StockMovement[]> {
    const { data } = await api.get<StockMovement[]>(
      `/inventory/products/${productId}/history?limit=${limit}`,
    );
    return data;
  },

  /**
   * Obtém estoque atual
   */
  async getStock(productId: number): Promise<StockInfo> {
    const { data } = await api.get<StockInfo>(`/inventory/products/${productId}/stock`);
    return data;
  },
};

