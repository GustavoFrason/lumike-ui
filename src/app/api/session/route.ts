/**
 * /api/session
 * ------------------------------------
 * Diz ao front se há sessão e quem é o usuário, a partir do cookie
 * httpOnly — o token em si nunca vai para o JavaScript do navegador.
 *
 * Responde sempre 200 (inclusive deslogado) para não disparar o
 * interceptor de 401 do axios. Cookie expirado é apagado aqui mesmo.
 */

import { NextResponse } from 'next/server';
import { clearAuthCookie, getAuthCookie } from '@/lib/cookies';
import { decodeJwtPayload, isJwtExpired } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export interface SessionResponse {
  authenticated: boolean;
  user?: { id: number; email: string; role: string | null };
}

function respond(body: SessionResponse) {
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}

export async function GET() {
  const token = await getAuthCookie();
  if (!token) return respond({ authenticated: false });

  const payload = decodeJwtPayload(token);
  if (!payload || isJwtExpired(payload) || payload.sub === undefined) {
    await clearAuthCookie();
    return respond({ authenticated: false });
  }

  return respond({
    authenticated: true,
    user: {
      id: Number(payload.sub),
      email: payload.email ?? '',
      role: payload.role ?? null,
    },
  });
}
