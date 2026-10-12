/**
 * /api/favorites
 * ------------------------------------
 * Proxy para a lista de produtos favoritos do usuário logado (cookie
 * httpOnly via handleGet).
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleGet(request, '/favorites', 'Erro ao buscar favoritos');
}
