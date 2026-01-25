/**
 * Collections Service
 * --------------------
 * Serviço para operações com coleções.
 */

import { api } from '../api';

export interface Collection {
  id: string; // UUID
  nome: string;
  slug?: string;
  descricao?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionDto {
  nome: string;
  slug?: string;
  descricao?: string;
  is_active?: boolean;
}

export type UpdateCollectionDto = Partial<CreateCollectionDto>;

export const collectionsService = {
  /**
   * Lista todas as coleções
   */
  async getAll(isActive?: boolean): Promise<Collection[]> {
    const params = new URLSearchParams();
    if (isActive !== undefined) {
      params.append('is_active', isActive.toString());
    }

    const query = params.toString();
    const { data } = await api.get<Collection[]>(`/colecoes${query ? `?${query}` : ''}`);
    return data;
  },

  /**
   * Busca uma coleção por ID
   */
  async getById(id: string): Promise<Collection> {
    const { data } = await api.get<Collection>(`/colecoes/${id}`);
    return data;
  },

  /**
   * Busca uma coleção por slug
   */
  async getBySlug(slug: string): Promise<Collection> {
    const { data } = await api.get<Collection>(`/colecoes/slug/${slug}`);
    return data;
  },

  /**
   * Cria uma nova coleção
   */
  async create(collection: CreateCollectionDto): Promise<Collection> {
    const { data } = await api.post<Collection>('/colecoes', collection);
    return data;
  },

  /**
   * Atualiza uma coleção
   */
  async update(id: string, collection: UpdateCollectionDto): Promise<Collection> {
    const { data } = await api.patch<Collection>(`/colecoes/${id}`, collection);
    return data;
  },

  /**
   * Remove uma coleção (soft delete)
   */
  async remove(id: string): Promise<Collection> {
    const { data } = await api.delete<Collection>(`/colecoes/${id}`);
    return data;
  },

  /**
   * Remove uma coleção permanentemente
   */
  async delete(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/colecoes/${id}/permanent`);
    return data;
  },
};

