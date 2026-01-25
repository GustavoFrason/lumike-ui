/**
 * use-products.ts
 * ------------------------------------
 * Hook específico para operações com produtos.
 * Reutiliza o hook genérico useApi.
 */

import { useCallback } from 'react';
import { useApi } from './use-api';
import { productsService, Product, CreateProductDto, UpdateProductDto } from '../services/products.service';
import { PaginatedResponse } from '../api';

export function useProducts() {
  const { execute: executeList, ...listApi } = useApi<PaginatedResponse<Product>>();
  const { execute: executeCreate, ...createApi } = useApi<Product>();
  const { execute: executeUpdate, ...updateApi } = useApi<Product>();
  const { execute: executeDelete, ...deleteApi } = useApi<Product>();

  const loadProducts = useCallback(
    async (page = 1, limit = 50, isActive?: boolean, search?: string, categoryId?: number) => {
      return executeList(() => productsService.getAll(page, limit, isActive, search, categoryId));
    },
    [executeList],
  );

  const createProduct = useCallback(
    async (product: CreateProductDto) => {
      return executeCreate(() => productsService.create(product));
    },
    [executeCreate],
  );

  const updateProduct = useCallback(
    async (id: number, product: UpdateProductDto) => {
      return executeUpdate(() => productsService.update(id, product));
    },
    [executeUpdate],
  );

  const deleteProduct = useCallback(
    async (id: number) => {
      return executeDelete(() => productsService.remove(id));
    },
    [executeDelete],
  );

  return {
    // List
    products: listApi.data?.data || [],
    pagination: listApi.data?.pagination,
    loadingProducts: listApi.loading,
    errorProducts: listApi.error,
    loadProducts,
    resetProducts: listApi.reset,

    // Create
    creating: createApi.loading,
    errorCreating: createApi.error,
    createProduct,
    resetCreate: createApi.reset,

    // Update
    updating: updateApi.loading,
    errorUpdating: updateApi.error,
    updateProduct,
    resetUpdate: updateApi.reset,

    // Delete
    deleting: deleteApi.loading,
    errorDeleting: deleteApi.error,
    deleteProduct,
    resetDelete: deleteApi.reset,
  };
}

