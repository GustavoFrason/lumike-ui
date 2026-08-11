import { api } from '../api';

export interface CreatePurchaseDto {
  supplier_id: number;
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
    unit_cost: number;
  }[];
}

export interface Purchase {
  id: number;
  supplier_id: number | null;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items_count: number;
  suppliers?: { name: string } | null;
}

export interface PurchaseWithItems extends Purchase {
  items: {
    id: number;
    product_id: number;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    products?: { name: string; sku: string | null } | null;
  }[];
}

export interface PaginatedPurchases {
  data: Purchase[];
  pagination: { page: number; limit: number; total: number };
}

export const purchasesService = {
  async create(data: CreatePurchaseDto): Promise<Purchase> {
    const response = await api.post('/compras', data);
    return response.data;
  },

  async findAll(): Promise<PaginatedPurchases> {
    const response = await api.get('/compras');
    return response.data;
  },

  async findOne(id: number): Promise<PurchaseWithItems> {
    const response = await api.get(`/compras/${id}`);
    return response.data;
  },
};
