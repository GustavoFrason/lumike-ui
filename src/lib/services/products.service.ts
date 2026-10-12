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
  /** 2º código da Zarpellon (alguns produtos têm dois). */
  sku2_alt?: string | null;
  /** Linha extra impressa na etiqueta (ex: LINHA PRATA, ARO 16, 45cm). */
  label_text?: string | null;
  /** Veio no topo da busca por bater exatamente com o código digitado. */
  exact_match?: boolean;
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
  // Não é digitado — vira o id autoincrementado via trigger no banco
  // quando vem vazio (ver ProductModal / fn_generate_product_sku).
  sku?: string;
  // SKU do fornecedor (rótulo no admin: "SKU Zarpellon") — obrigatório.
  sku2: string;
  sku2_alt?: string | null;
  label_text?: string | null;
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

/** `newest` = mais novos primeiro (padrão da API); `code` = nº do item crescente. */
export type ProductSort = 'newest' | 'code';

/**
 * Teto de linhas por requisição do Supabase (max_rows). Para "todos os
 * produtos" use getAllPages, que pagina nesse tamanho.
 */
export const MAX_PRODUCTS_PER_REQUEST = 1000;

export interface GetAllPagesOptions {
  isActive?: boolean;
  search?: string;
  categoryId?: number;
  sort?: ProductSort;
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
    sort?: ProductSort,
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (isActive !== undefined) {
      params.append('is_active', isActive.toString());
    }
    const term = search?.trim();
    if (term) {
      params.append('search', term);
    }
    if (category_id) {
      params.append('category_id', category_id.toString());
    }
    if (isFeatured !== undefined) {
      params.append('is_featured', isFeatured.toString());
    }
    if (sort) {
      params.append('sort', sort);
    }

    const { data } = await api.get<PaginatedResponse<Product>>(`/produtos?${params.toString()}`);
    return data;
  },

  /**
   * Busca TODOS os produtos (pagina de 1000 em 1000 até o total). Pedir
   * limit=100000 numa requisição só não funciona: o Supabase corta em
   * 1000 e os produtos mais antigos (códigos baixos) sumiam da tela de
   * Etiquetas e da exportação.
   */
  async getAllPages(
    options: GetAllPagesOptions = {},
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<Product[]> {
    const byId = new Map<number, Product>();
    let page = 1;
    let total = Infinity;

    while (byId.size < total) {
      const res = await productsService.getAll(
        page,
        MAX_PRODUCTS_PER_REQUEST,
        options.isActive,
        options.search,
        options.categoryId,
        undefined,
        options.sort ?? 'code',
      );
      // exact_match no topo da pág. 1 pode repetir item de outra página
      for (const product of res.data) byId.set(product.id, product);
      total = res.pagination?.total ?? byId.size;
      onProgress?.(byId.size, total);

      if (res.data.length < MAX_PRODUCTS_PER_REQUEST) break;
      page += 1;
    }

    return [...byId.values()];
  },

  /**
   * Busca EXATA por código (sku, sku2, código Zarpellon 2 ou id), já
   * ordenada por prioridade. Usada no cadastro (duplicidade) e no leitor
   * de código do PDV.
   */
  async lookup(code: string, activeOnly = false): Promise<Product[]> {
    const params = new URLSearchParams({ code: code.trim() });
    if (activeOnly) params.append('active_only', 'true');
    const { data } = await api.get<Product[]>(`/produtos/lookup?${params.toString()}`);
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

  async bulkUpdateStatus(ids: number[], is_active: boolean): Promise<void> {
    // Rota Next em português, como as demais (/products/... não existe → 404).
    await api.patch('/produtos/bulk-status', { ids, is_active });
  },
};
