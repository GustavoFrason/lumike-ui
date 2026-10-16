/**
 * /api/[...path]
 * ------------------------------------
 * Proxy único do BFF para a lumike-api. O mapeamento de cada prefixo fica
 * em `lib/bff-routes.ts`, e o repasse em `lib/bff-proxy.ts`.
 *
 * `login`, `logout`, `register` e `session` têm rota própria (rota
 * estática ganha da catch-all), porque mexem no cookie de sessão.
 */

import { NextRequest } from 'next/server';
import { forwardToBackend } from '@/lib/bff-proxy';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ path: string[] }> };

async function handler(request: NextRequest, { params }: Context) {
  const { path } = await params;
  return forwardToBackend(request, path);
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
