/**
 * use-api.ts
 * ------------------------------------
 * Hook reutilizável para operações de API com tratamento de erros e loading states.
 */

import { useState, useCallback, useMemo } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useApi<T = unknown>(options: UseApiOptions<T> = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        let errorMessage = 'Erro desconhecido';
        if (err && typeof err === 'object') {
          const e = err as { response?: { data?: { error?: string } }; message?: string };
          errorMessage = e.response?.data?.error || e.message || errorMessage;
        }
        setError(errorMessage);
        options.onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setLoading(false);
  }, []);

  return useMemo(
    () => ({
      loading,
      error,
      data,
      execute,
      reset,
    }),
    [loading, error, data, execute, reset],
  );
}
