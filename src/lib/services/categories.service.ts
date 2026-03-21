/**
 * Categories Service
 * --------------------
 * Serviço para operações com categorias.
 */

import { api } from '../api';

export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  image_url?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export const categoriesService = {
  /**
   * Lista todas as categorias
   */
  async getAll(isActive?: boolean): Promise<Category[]> {
    const params = new URLSearchParams();
    if (isActive !== undefined) {
      params.append('is_active', isActive.toString());
    }

    const query = params.toString();
    const { data } = await api.get<Category[]>(`/categorias${query ? `?${query}` : ''}`);
    return data;
  },

  /**
   * Busca uma categoria por ID
   */
  async getById(id: number): Promise<Category> {
    const { data } = await api.get<Category>(`/categorias/${id}`);
    return data;
  },

  /**
   * Busca uma categoria por slug
   */
  async getBySlug(slug: string): Promise<Category> {
    const { data } = await api.get<Category>(`/categorias/slug/${slug}`);
    return data;
  },

  /**
   * Cria uma nova categoria
   */
  async create(category: CreateCategoryDto): Promise<Category> {
    const { data } = await api.post<Category>('/categorias', category);
    return data;
  },

  /**
   * Atualiza uma categoria
   */
  async update(id: number, category: UpdateCategoryDto): Promise<Category> {
    const { data } = await api.patch<Category>(`/categorias/${id}`, category);
    return data;
  },

  /**
   * Remove uma categoria (soft delete)
   */
  async remove(id: number): Promise<Category> {
    const { data } = await api.delete<Category>(`/categorias/${id}`);
    return data;
  },

  /**
   * Remove uma categoria permanentemente
   */
  async delete(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/categorias/${id}/permanent`);
    return data;
  },
};
