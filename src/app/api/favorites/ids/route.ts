/**
 * /api/favorites/ids
 * ------------------------------------
 * Proxy para os IDs dos produtos favoritos do usuário logado.
 *
 * Usa o cookie httpOnly (via handleGet/proxyRequest). Antes repassava só
 * um header Authorization que o front nunca mandava — o backend
 * respondia 401 e o interceptor do axios deslogava o usuário a cada F5.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleGet(request, '/favorites/ids', 'Erro ao buscar IDs favoritos');
}
