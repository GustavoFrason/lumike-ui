/**
 * use-inventory.ts
 * ------------------------------------
 * Hook específico para operações de estoque.
 */

import { useCallback } from 'react';
import { useApi } from './use-api';
import {
  inventoryService,
  StockEntryDto,
  StockExitDto,
  StockMovement,
  StockInfo,
} from '../services/inventory.service';

export function useInventory(productId?: number) {
  const { execute: executeEntry, ...entryApi } = useApi();
  const { execute: executeExit, ...exitApi } = useApi();
  const { execute: executeHistory, ...historyApi } = useApi<StockMovement[]>();
  const { execute: executeStock, ...stockApi } = useApi<StockInfo>();

  const addStock = useCallback(
    async (dto: StockEntryDto) => {
      if (!productId) throw new Error('Product ID é obrigatório');
      return executeEntry(() => inventoryService.addStock(productId, dto));
    },
    [productId, executeEntry],
  );

  const removeStock = useCallback(
    async (dto: StockExitDto) => {
      if (!productId) throw new Error('Product ID é obrigatório');
      return executeExit(() => inventoryService.removeStock(productId, dto));
    },
    [productId, executeExit],
  );

  const loadHistory = useCallback(
    async (limit: number = 50) => {
      if (!productId) throw new Error('Product ID é obrigatório');
      return executeHistory(() => inventoryService.getHistory(productId, limit));
    },
    [productId, executeHistory],
  );

  const loadStock = useCallback(async () => {
    if (!productId) throw new Error('Product ID é obrigatório');
    return executeStock(() => inventoryService.getStock(productId));
  }, [productId, executeStock]);

  return {
    // Entry
    adding: entryApi.loading,
    errorAdding: entryApi.error,
    addStock,
    resetAdd: entryApi.reset,

    // Exit
    removing: exitApi.loading,
    errorRemoving: exitApi.error,
    removeStock,
    resetRemove: exitApi.reset,

    // History
    history: historyApi.data || [],
    loadingHistory: historyApi.loading,
    errorHistory: historyApi.error,
    loadHistory,
    resetHistory: historyApi.reset,

    // Stock
    stock: stockApi.data,
    loadingStock: stockApi.loading,
    errorStock: stockApi.error,
    loadStock,
    resetStock: stockApi.reset,
  };
}
