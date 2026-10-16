import { api } from '../api';

export interface CreatePurchaseDto {
  supplier_id: number;
  /** Data real da compra ('YYYY-MM-DD'). Sem ela, o banco usa hoje (Brasília). */
  purchase_date?: string;
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
  /** Data real da compra ('YYYY-MM-DD'); `created_at` é quando foi registrada. */
  purchase_date: string;
  created_at: string;
  updated_at: string;
  items_count: number;
  suppliers?: { name: string } | null;
}

/** Campos do produto que vêm com cada item: o que a etiqueta precisa. */
export interface PurchaseItemProduct {
  id: number;
  name: string;
  sku: string | null;
  sku2?: string | null;
  price: number;
  preco_promocional?: number | null;
  label_text?: string | null;
  is_active: boolean;
}

export interface PurchaseWithItems extends Purchase {
  items: {
    id: number;
    product_id: number;
    /** Em peças (a importação já desmembra os kits). */
    quantity: number;
    unit_cost: number;
    total_cost: number | null;
    products?: PurchaseItemProduct | null;
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

  /** Mais recentes primeiro, pela data da compra. */
  async findAll(page = 1, limit = 50): Promise<PaginatedPurchases> {
    const response = await api.get(`/compras?page=${page}&limit=${limit}`);
    return response.data;
  },

  async findOne(id: number): Promise<PurchaseWithItems> {
    const response = await api.get(`/compras/${id}`);
    return response.data;
  },
};
