'use client';

/**
 * SessionContext
 * ------------------------------------
 * Fonte única de "quem está logado" no front, lida de /api/session (que
 * olha o cookie httpOnly). Substitui o JWT que ficava no localStorage —
 * exposto a qualquer XSS e que o logout nem apagava.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { SessionResponse } from '@/app/api/session/route';

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';
export type SessionUser = NonNullable<SessionResponse['user']>;

interface SessionContextValue {
  status: SessionStatus;
  user: SessionUser | null;
  /** Relê a sessão (ex: logo após o login, antes de navegar). */
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue>({
  status: 'loading',
  user: null,
  refresh: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      // fetch puro (não o `api` do axios) para ficar fora do interceptor de 401.
      const res = await fetch('/api/session', { cache: 'no-store' });
      const data = (await res.json()) as SessionResponse;
      setUser(data.authenticated && data.user ? data.user : null);
      setStatus(data.authenticated ? 'authenticated' : 'unauthenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    // Limpeza única do token que versões antigas guardavam no localStorage.
    try {
      localStorage.removeItem('token');
    } catch {
      // localStorage bloqueado (aba privada etc.) — nada a limpar.
    }
    void refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ status, user, refresh }}>{children}</SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
