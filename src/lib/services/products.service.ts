/**
 * Products Service
 * --------------------
 * Serviço para operações com produtos.
 */

import { api, PaginatedResponse } from '../api';

export interface Product {
  id: number;
  sku?: string;
  sku2?: string;
  name: string;
  short_description: string;
  description?: string;
  slug?: string;
  price: number;
  preco_promocional?: number;
  cost_price?: number;
  purchase_date: string;
  category_id?: number;
  supplier_id?: number;
  colecao_id?: string;
  collection?: string;
  current_stock: number;
  min_stock: number;
  is_active: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    id: number;
    name: string;
    slug?: string;
    image_url?: string;
  };
  images?: {
    url: string;
    ordem: number;
  }[];
}

export interface CreateProductDto {
  sku?: string;
  sku2?: string;
  name: string;
  short_description: string;
  description?: string;
  slug?: string;
  price: number;
  preco_promocional?: number;
  cost_price?: number;
  purchase_date: string;
  category_id?: number;
  supplier_id?: number;
  colecao_id?: string;
  collection?: string;
  current_stock?: number;
  min_stock?: number;
  is_active?: boolean;
  is_featured?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ImportItem {
  sku: string;
  name_xml: string;
  quantity_xml: number;
  cost_price_xml: number;
  existing_product?: { id: number; name: string; current_stock: number } | null;
  action: 'UPDATE_STOCK' | 'CREATE_NEW';
}

export interface ImportResponse {
  nfeId: string;
  totalItems: number;
  items: ImportItem[];
}

export const productsService = {
  /**
   * Lista todos os produtos
   */
  async getAll(
    page = 1,
    limit = 50,
    isActive?: boolean,
    search?: string,
    category_id?: number,
    isFeatured?: boolean,
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (isActive !== undefined) {
      params.append('is_active', isActive.toString());
    }
    if (search) {
      params.append('search', search);
    }
    if (category_id) {
      params.append('category_id', category_id.toString());
    }
    if (isFeatured !== undefined) {
      params.append('is_featured', isFeatured.toString());
    }

    const { data } = await api.get<PaginatedResponse<Product>>(`/produtos?${params.toString()}`);
    return data;
  },

  /**
   * Busca um produto por ID
   */
  async getById(id: number): Promise<Product> {
    const { data } = await api.get<Product>(`/produtos/${id}`);
    return data;
  },

  /**
   * Busca um produto por slug
   */
  async getBySlug(slug: string): Promise<Product> {
    const { data } = await api.get<Product>(`/produtos/slug/${slug}`);
    return data;
  },

  /**
   * Cria um novo produto
   */
  async create(product: CreateProductDto): Promise<Product> {
    const { data } = await api.post<Product>('/produtos', product);
    return data;
  },

  /**
   * Atualiza um produto
   */
  async update(id: number, product: UpdateProductDto): Promise<Product> {
    const { data } = await api.patch<Product>(`/produtos/${id}`, product);
    return data;
  },

  /**
   * Remove um produto (soft delete)
   */
  async remove(id: number): Promise<Product> {
    const { data } = await api.delete<Product>(`/produtos/${id}`);
    return data;
  },

  /**
   * Remove um produto permanentemente
   */
  async delete(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/produtos/${id}/permanent`);
    return data;
  },

  async importXml(file: File): Promise<ImportResponse> {
    return this.importFile(file);
  },

  async importFile(file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ImportResponse>('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async confirmImport(
    items: ImportItem[],
  ): Promise<{ updated: number; created: number; errors: number }> {
    const { data } = await api.post<{ updated: number; created: number; errors: number }>(
      '/produtos/import/confirm',
      items,
    );
    return data;
  },

  async bulkUpdateStatus(ids: number[], is_active: boolean): Promise<void> {
    await api.patch('/products/bulk-status', { ids, is_active });
  },
};
