/**
 * use-customers.ts
 * ------------------------------------
 * Hook específico para operações com clientes.
 */

import { useCallback } from 'react';
import { useApi } from './use-api';
import {
  customersService,
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  PaginatedResponse,
} from '../services/customers.service';

export type { Customer };

export function useCustomers() {
  const { execute: executeList, ...listApi } = useApi<PaginatedResponse<Customer>>();
  const { execute: executeCreate, ...createApi } = useApi<Customer>();
  const { execute: executeUpdate, ...updateApi } = useApi<Customer>();
  const { execute: executeDelete, ...deleteApi } = useApi<{ message: string }>();

  const loadCustomers = useCallback(
    async (page = 1, limit = 50) => {
      return executeList(() => customersService.getAll(page, limit));
    },
    [executeList],
  );

  const createCustomer = useCallback(
    async (customer: CreateCustomerDto) => {
      return executeCreate(() => customersService.create(customer));
    },
    [executeCreate],
  );

  const updateCustomer = useCallback(
    async (id: number, customer: UpdateCustomerDto) => {
      return executeUpdate(() => customersService.update(id, customer));
    },
    [executeUpdate],
  );

  const deleteCustomer = useCallback(
    async (id: number) => {
      return executeDelete(() => customersService.remove(id));
    },
    [executeDelete],
  );

  return {
    // List
    customers: listApi.data?.data || [],
    pagination: listApi.data?.pagination,
    loadingCustomers: listApi.loading,
    errorCustomers: listApi.error,
    loadCustomers,
    resetCustomers: listApi.reset,

    // Create
    creating: createApi.loading,
    errorCreating: createApi.error,
    createCustomer,
    resetCreate: createApi.reset,

    // Update
    updating: updateApi.loading,
    errorUpdating: updateApi.error,
    updateCustomer,
    resetUpdate: updateApi.reset,

    // Delete
    deleting: deleteApi.loading,
    errorDeleting: deleteApi.error,
    deleteCustomer,
    resetDelete: deleteApi.reset,
  };
}
