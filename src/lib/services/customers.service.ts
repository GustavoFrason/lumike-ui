/**
 * Customers Service
 * --------------------
 * Serviço para operações com clientes.
 */

import { api, type PaginatedResponse } from '../api';

export type { PaginatedResponse };

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  notes?: string;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

export const customersService = {
  /**
   * Lista todos os clientes
   */
  async getAll(page = 1, limit = 50, search?: string): Promise<PaginatedResponse<Customer>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const { data } = await api.get<PaginatedResponse<Customer>>(
      `/clientes?${params.toString()}`,
    );
    return data;
  },

  /**
   * Busca um cliente por ID
   */
  async getById(id: number): Promise<Customer> {
    const { data } = await api.get<Customer>(`/clientes/${id}`);
    return data;
  },

  /**
   * Cria um novo cliente
   */
  async create(customer: CreateCustomerDto): Promise<Customer> {
    const { data } = await api.post<Customer>('/clientes', customer);
    return data;
  },

  /**
   * Atualiza um cliente
   */
  async update(id: number, customer: UpdateCustomerDto): Promise<Customer> {
    const { data } = await api.patch<Customer>(`/clientes/${id}`, customer);
    return data;
  },

  /**
   * Remove um cliente
   */
  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/clientes/${id}`);
    return data;
  },
};

