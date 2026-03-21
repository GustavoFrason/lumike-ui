/**
 * use-collections.ts
 * ------------------------------------
 * Hook específico para operações com coleções.
 * Reutiliza o hook genérico useApi.
 */

import { useCallback } from 'react';
import { useApi } from './use-api';
import {
  collectionsService,
  Collection,
  CreateCollectionDto,
  UpdateCollectionDto,
} from '../services/collections.service';

export function useCollections() {
  const { execute: executeList, ...listApi } = useApi<Collection[]>();
  const { execute: executeCreate, ...createApi } = useApi<Collection>();
  const { execute: executeUpdate, ...updateApi } = useApi<Collection>();
  const { execute: executeDelete, ...deleteApi } = useApi<Collection>();

  const loadCollections = useCallback(
    async (isActive?: boolean) => {
      return executeList(() => collectionsService.getAll(isActive));
    },
    [executeList],
  );

  const createCollection = useCallback(
    async (collection: CreateCollectionDto) => {
      return executeCreate(() => collectionsService.create(collection));
    },
    [executeCreate],
  );

  const updateCollection = useCallback(
    async (id: string, collection: UpdateCollectionDto) => {
      return executeUpdate(() => collectionsService.update(id, collection));
    },
    [executeUpdate],
  );

  const deleteCollection = useCallback(
    async (id: string) => {
      return executeDelete(() => collectionsService.remove(id));
    },
    [executeDelete],
  );

  return {
    // List
    collections: listApi.data || [],
    loadingCollections: listApi.loading,
    errorCollections: listApi.error,
    loadCollections,
    resetCollections: listApi.reset,

    // Create
    creating: createApi.loading,
    errorCreating: createApi.error,
    createCollection,
    resetCreate: createApi.reset,

    // Update
    updating: updateApi.loading,
    errorUpdating: updateApi.error,
    updateCollection,
    resetUpdate: updateApi.reset,

    // Delete
    deleting: deleteApi.loading,
    errorDeleting: deleteApi.error,
    deleteCollection,
    resetDelete: deleteApi.reset,
  };
}
