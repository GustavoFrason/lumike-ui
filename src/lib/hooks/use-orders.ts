/**
 * use-orders.ts
 * ------------------------------------
 * Hook específico para operações com pedidos/vendas.
 */

import { useCallback } from 'react';
import { useApi } from './use-api';
import {
  ordersService,
  Order,
  CreateOrderDto,
  PaginatedResponse,
} from '../services/orders.service';

export type { Order };

export function useOrders() {
  const { execute: executeList, ...listApi } = useApi<PaginatedResponse<Order>>();
  const { execute: executeCreate, ...createApi } = useApi<Order>();
  const { execute: executeUpdate, ...updateApi } = useApi<Order>();
  const { execute: executeDelete, ...deleteApi } = useApi<{ message: string }>();

  const loadOrders = useCallback(
    async (page = 1, limit = 50, status?: string, customerId?: number) => {
      return executeList(() => ordersService.getAll(page, limit, status, customerId));
    },
    [executeList],
  );

  const createOrder = useCallback(
    async (order: CreateOrderDto) => {
      return executeCreate(() => ordersService.create(order));
    },
    [executeCreate],
  );

  const updateOrderStatus = useCallback(
    async (id: number, status: string) => {
      return executeUpdate(() => ordersService.updateStatus(id, status));
    },
    [executeUpdate],
  );

  const deleteOrder = useCallback(
    async (id: number) => {
      return executeDelete(() => ordersService.remove(id));
    },
    [executeDelete],
  );

  return {
    // List
    orders: listApi.data?.data || [],
    pagination: listApi.data?.pagination,
    loadingOrders: listApi.loading,
    errorOrders: listApi.error,
    loadOrders,
    resetOrders: listApi.reset,

    // Create
    creating: createApi.loading,
    errorCreating: createApi.error,
    createOrder,
    resetCreate: createApi.reset,

    // Update
    updating: updateApi.loading,
    errorUpdating: updateApi.error,
    updateOrderStatus,
    resetUpdate: updateApi.reset,

    // Delete
    deleting: deleteApi.loading,
    errorDeleting: deleteApi.error,
    deleteOrder,
    resetDelete: deleteApi.reset,
  };
}

