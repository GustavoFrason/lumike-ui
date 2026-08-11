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

export interface SellerStock {
  user_id: number;
  name: string;
  quantity: number;
}

export interface ProductStock {
  product_id: number;
  total: number;
  central: number;
  sellers: SellerStock[];
}

export const inventoryService = {
  /**
   * Registra entrada de estoque em uma localidade específica
   */
  async addStock(productId: number, dto: StockEntryDto, userId?: number | null) {
    const url = `/inventory/products/${productId}/entry${userId ? `?userId=${userId}` : ''}`;
    const { data } = await api.post(url, dto);
    return data;
  },

  /**
   * Registra saída de estoque de uma localidade específica
   */
  async removeStock(productId: number, dto: StockExitDto, userId?: number | null) {
    const url = `/inventory/products/${productId}/exit${userId ? `?userId=${userId}` : ''}`;
    const { data } = await api.post(url, dto);
    return data;
  },

  /**
   * Transfere estoque entre vendedoras/central
   */
  async transfer(productId: number, data: { 
    from_user_id: number | null; 
    to_user_id: number | null; 
    quantity: number;
    notes?: string;
  }) {
    await api.post(`/inventory/products/${productId}/transfer`, data);
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
   * Obtém o estoque detalhado de um produto
   */
  async getStock(productId: number): Promise<ProductStock> {
    const { data } = await api.get<ProductStock>(`/inventory/products/${productId}/stock`);
    return data;
  },

  /**
   * Obtém todos os produtos e quantidades em posse de um usuário
   */
  async getUserStock(userId: number): Promise<UserInventoryItem[]> {
    const { data } = await api.get<UserInventoryItem[]>(`/inventory/users/${userId}`);
    return data;
  },

  /**
   * Obtém, de uma vez, tudo que está com cada revendedor(a) — pra
   * conferência periódica de inventário.
   */
  async getAllSellersStock(): Promise<SellerInventory[]> {
    const { data } = await api.get<SellerInventory[]>('/inventory/sellers');
    return data;
  },

  /**
   * Registra uma conferência física de estoque numa localidade. Se não
   * houver diferença entre o esperado e o contado, nada é ajustado.
   */
  async adjustFromCount(
    productId: number,
    data: { user_id: number | null; counted_quantity: number; reason: string },
  ): Promise<StockAdjustmentResult> {
    const { data: result } = await api.post<StockAdjustmentResult>(
      `/inventory/products/${productId}/adjustment`,
      data,
    );
    return result;
  },
};

export interface StockAdjustmentResult {
  success: boolean;
  expected_quantity: number;
  counted_quantity: number;
  delta: number;
  message?: string;
}

export interface UserInventoryItem {
  product_id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface SellerInventory {
  user_id: number;
  name: string;
  total_items: number;
  items: UserInventoryItem[];
}
