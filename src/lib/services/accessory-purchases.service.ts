'use client';

import { api, type PaginatedResponse } from '../api';

export interface AccessoryPurchase {
  id: number;
  type: string;
  quantity: number;
  supplier: string;
  purchase_date: string;
  unit_price: number;
  notes?: string;
  created_at: string;
}

export interface CreateAccessoryPurchaseDto {
  type: string;
  quantity: number;
  supplier: string;
  purchase_date: string;
  unit_price: number;
  notes?: string;
}

export const accessoryPurchasesService = {
  async getAll(page = 1, limit = 50, type?: string): Promise<PaginatedResponse<AccessoryPurchase>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (type) params.append('type', type);

    const { data } = await api.get<PaginatedResponse<AccessoryPurchase>>(
      `/accessory-purchases?${params.toString()}`,
    );
    return data;
  },

  async create(item: CreateAccessoryPurchaseDto): Promise<AccessoryPurchase> {
    const { data } = await api.post<AccessoryPurchase>('/accessory-purchases', item);
    return data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/accessory-purchases/${id}`);
    return data;
  },
};
