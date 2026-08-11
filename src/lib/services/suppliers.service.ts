import { api } from '../api';

export interface Supplier {
  id: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  category?: string;
  notes?: string;
}

export interface ROIAnalysis {
  id: number;
  supplier_id: number;
  supplier_name: string;
  total_invested: number;
  total_revenue: number;
  gross_profit: number;
  roi: number; // This is the percentage
}

export interface PaginatedSuppliers {
  data: Supplier[];
  pagination: { page: number; limit: number; total: number };
}

export const suppliersService = {
  async findAll(page = 1, limit = 50): Promise<PaginatedSuppliers> {
    const response = await api.get(`/fornecedores?page=${page}&limit=${limit}`);
    return response.data;
  },

  async findOne(id: number) {
    const response = await api.get(`/fornecedores/${id}`);
    return response.data;
  },

  async create(data: Partial<Supplier>) {
    const response = await api.post('/fornecedores', data);
    return response.data;
  },

  async update(id: number, data: Partial<Supplier>) {
    const response = await api.patch(`/fornecedores/${id}`, data);
    return response.data;
  },

  async remove(id: number) {
    const response = await api.delete(`/fornecedores/${id}`);
    return response.data;
  },

  async getROIAnalysis(): Promise<ROIAnalysis[]> {
    const response = await api.get('/fornecedores/roi-analysis');
    return (response.data || []).map((item: Omit<ROIAnalysis, 'id'>) => ({
      ...item,
      id: item.supplier_id,
    }));
  },
};
