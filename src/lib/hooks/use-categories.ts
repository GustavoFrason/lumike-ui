/**
 * use-categories.ts
 * ------------------------------------
 * Hook específico para operações com categorias.
 * Reutiliza o hook genérico useApi.
 */

import { useCallback } from 'react';
import { useApi } from './use-api';
import {
  categoriesService,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../services/categories.service';

export function useCategories() {
  const { execute: executeList, ...listApi } = useApi<Category[]>();
  const { execute: executeCreate, ...createApi } = useApi<Category>();
  const { execute: executeUpdate, ...updateApi } = useApi<Category>();
  const { execute: executeDelete, ...deleteApi } = useApi<Category>();

  const loadCategories = useCallback(
    async (isActive?: boolean) => {
      return executeList(() => categoriesService.getAll(isActive));
    },
    [executeList],
  );

  const createCategory = useCallback(
    async (category: CreateCategoryDto) => {
      return executeCreate(() => categoriesService.create(category));
    },
    [executeCreate],
  );

  const updateCategory = useCallback(
    async (id: number, category: UpdateCategoryDto) => {
      return executeUpdate(() => categoriesService.update(id, category));
    },
    [executeUpdate],
  );

  const deleteCategory = useCallback(
    async (id: number) => {
      return executeDelete(() => categoriesService.remove(id));
    },
    [executeDelete],
  );

  return {
    // List
    categories: listApi.data || [],
    loadingCategories: listApi.loading,
    errorCategories: listApi.error,
    loadCategories,
    resetCategories: listApi.reset,

    // Create
    creating: createApi.loading,
    errorCreating: createApi.error,
    createCategory,
    resetCreate: createApi.reset,

    // Update
    updating: updateApi.loading,
    errorUpdating: updateApi.error,
    updateCategory,
    resetUpdate: updateApi.reset,

    // Delete
    deleting: deleteApi.loading,
    errorDeleting: deleteApi.error,
    deleteCategory,
    resetDelete: deleteApi.reset,
  };
}
