import { useState, useCallback } from 'react';
import { purchasesService, CreatePurchaseDto, Purchase } from '../services/purchases.service';
import { getErrorMessage } from '../utils';

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.findAll();
      setPurchases(response.data || []);
      return response;
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar compras'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createPurchase = useCallback(async (data: CreatePurchaseDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.create(data);
      return response;
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao registrar compra'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    purchases,
    loading,
    error,
    loadPurchases,
    createPurchase,
  };
}
