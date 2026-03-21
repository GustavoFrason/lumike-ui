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

export const purchasesService = {
  async create(data: CreatePurchaseDto) {
    const response = await api.post('/compras', data);
    return response.data;
  },

  async findAll() {
    const response = await api.get('/compras');
    return response.data;
  },

  async findOne(id: number) {
    const response = await api.get(`/compras/${id}`);
    return response.data;
  },
};
