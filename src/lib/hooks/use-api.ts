/**
 * use-api.ts
 * ------------------------------------
 * Hook reutilizável para operações de API com tratamento de erros e loading states.
 */

import { useState, useCallback, useMemo, useRef } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useApi<T = unknown>(options: UseApiOptions<T> = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  // Só a chamada mais recente pode mexer no estado: numa busca digitada,
  // a resposta lenta de "7" chegava depois da de "71" e sobrescrevia a lista.
  const latestCall = useRef(0);

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      const callId = ++latestCall.current;
      const isLatest = () => callId === latestCall.current;
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (isLatest()) {
          setData(result);
          options.onSuccess?.(result);
        }
        return result;
      } catch (err: unknown) {
        if (isLatest()) {
          let errorMessage = 'Erro desconhecido';
          if (err && typeof err === 'object') {
            const e = err as { response?: { data?: { error?: string } }; message?: string };
            errorMessage = e.response?.data?.error || e.message || errorMessage;
          }
          setError(errorMessage);
          options.onError?.(errorMessage);
        }
        throw err;
      } finally {
        if (isLatest()) setLoading(false);
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
