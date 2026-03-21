import { api } from '../api';

export type WarrantyStatus =
  | 'pending'
  | 'analyzing'
  | 'factory'
  | 'ready'
  | 'finished'
  | 'rejected';
export type WarrantyType = 'plating' | 'break' | 'stone_loss' | 'other';

export type WarrantyOrigin = 'sold' | 'stock';

export interface Warranty {
  id: string;
  customer_id?: number;
  order_id?: number;
  product_id: number;
  status: WarrantyStatus;
  type: WarrantyType;
  origin: WarrantyOrigin;
  description?: string;
  internal_notes?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  finished_at?: string;
  customers?: { name: string; email: string; whatsapp?: string };
  products?: { name: string; sku: string; images?: any[] };
  orders?: { created_at: string; total_amount: number };
}

export interface CreateWarrantyDto {
  customer_id?: number;
  order_id?: number;
  product_id: number;
  type: WarrantyType;
  origin: WarrantyOrigin;
  description?: string;
  images?: string[];
}

export interface UpdateWarrantyDto {
  status?: WarrantyStatus;
  internal_notes?: string;
  type?: WarrantyType;
  description?: string;
}

export const warrantiesService = {
  async findAll(page = 1, limit = 50, filters: any = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    const response = await api.get(`/garantias?${params.toString()}`);
    return response.data;
  },

  async findOne(id: string) {
    const response = await api.get(`/garantias/${id}`);
    return response.data;
  },

  async create(data: CreateWarrantyDto) {
    const response = await api.post('/garantias', data);
    return response.data;
  },

  async update(id: string, data: UpdateWarrantyDto) {
    const response = await api.patch(`/garantias/${id}`, data);
    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete(`/garantias/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/garantias/stats');
    return response.data;
  },
};
