/**
 * jwt.ts
 * ------------------------------------
 * Decodificação do payload do JWT — SEM verificar assinatura.
 *
 * Serve só para decisões de UX (redirecionar, mostrar "logado"); quem
 * autoriza de verdade é o backend, que valida a assinatura em toda
 * chamada. Sem dependência de `next/headers`, então funciona no proxy.ts,
 * em route handlers e no navegador.
 */

export interface JwtPayload {
  sub?: number | string;
  email?: string;
  role?: string | null;
  /** Expiração em segundos desde a epoch (padrão JWT). */
  exp?: number;
}

export function decodeJwtPayload(token: string | undefined | null): JwtPayload | null {
  if (!token) return null;

  const part = token.split('.')[1];
  if (!part) return null;

  try {
    // base64url → base64 (com padding)
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));

    return payload && typeof payload === 'object' ? (payload as JwtPayload) : null;
  } catch {
    return null;
  }
}

export function isJwtExpired(payload: JwtPayload, nowMs: number = Date.now()): boolean {
  if (typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 <= nowMs;
}
