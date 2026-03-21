import { useState, useCallback } from 'react';
import { suppliersService, Supplier } from '../services/suppliers.service';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = useCallback(async (page = 1, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const response = await suppliersService.findAll(page, limit);
      setSuppliers(response.data || []);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSupplier = async (data: Partial<Supplier>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await suppliersService.create(data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar fornecedor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (id: number, data: Partial<Supplier>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await suppliersService.update(id, data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar fornecedor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await suppliersService.remove(id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir fornecedor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    suppliers,
    loading,
    error,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
}
