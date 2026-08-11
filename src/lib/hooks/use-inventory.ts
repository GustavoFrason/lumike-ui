/**
 * use-inventory.ts
 * ------------------------------------
 * Hook específico para operações de estoque.
 */

import { useCallback, useMemo } from 'react';
import { useApi } from './use-api';
import {
  inventoryService,
  StockAdjustmentResult,
  StockEntryDto,
  StockExitDto,
  StockMovement,
  ProductStock, // Novo tipo
} from '../services/inventory.service';

export function useInventory(productId?: number) {
  const { execute: executeEntry, ...entryApi } = useApi();
  const { execute: executeExit, ...exitApi } = useApi();
  const { execute: executeTransfer, ...transferApi } = useApi();
  const { execute: executeAdjustment, ...adjustmentApi } = useApi<StockAdjustmentResult>();
  const { execute: executeHistory, ...historyApi } = useApi<StockMovement[]>();
  const { execute: executeStock, ...stockApi } = useApi<ProductStock>();

  const addStock = useCallback(
    async (dto: StockEntryDto, userId?: number | null) => {
      if (!productId) throw new Error('Product ID é obrigatório');
      return executeEntry(() => inventoryService.addStock(productId, dto, userId));
    },
    [productId, executeEntry],
  );

  const removeStock = useCallback(
    async (dto: StockExitDto, userId?: number | null) => {
      if (!productId) throw new Error('Product ID é obrigatório');
      return executeExit(() => inventoryService.removeStock(productId, dto, userId));
    },
    [productId, executeExit],
  );

  const transferStock = useCallback(
    async (data: {
      from_user_id: number | null;
      to_user_id: number | null;
      quantity: number;
      notes?: string;
    }) => {
      if (!productId) throw new Error('Product ID é obrigatório');
      return executeTransfer(() => inventoryService.transfer(productId, data));
    },
    [productId, executeTransfer],
  );

  const adjustFromCount = useCallback(
    async (data: { user_id: number | null; counted_quantity: number; reason: string }) => {
      if (!productId) throw new Error('Product ID é obrigatório');
      return executeAdjustment(() => inventoryService.adjustFromCount(productId, data));
    },
    [productId, executeAdjustment],
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

  return useMemo(
    () => ({
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

      // Transfer
      transferring: transferApi.loading,
      errorTransferring: transferApi.error,
      transferStock,
      resetTransfer: transferApi.reset,

      // Adjustment (conferência física)
      adjusting: adjustmentApi.loading,
      errorAdjusting: adjustmentApi.error,
      adjustFromCount,
      resetAdjustment: adjustmentApi.reset,

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
    }),
    [
      entryApi.loading,
      entryApi.error,
      addStock,
      entryApi.reset,
      exitApi.loading,
      exitApi.error,
      removeStock,
      exitApi.reset,
      transferApi.loading,
      transferApi.error,
      transferStock,
      transferApi.reset,
      adjustmentApi.loading,
      adjustmentApi.error,
      adjustFromCount,
      adjustmentApi.reset,
      historyApi.data,
      historyApi.loading,
      historyApi.error,
      loadHistory,
      historyApi.reset,
      stockApi.data,
      stockApi.loading,
      stockApi.error,
      loadStock,
      stockApi.reset,
    ],
  );
}
