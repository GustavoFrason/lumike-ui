/**
 * /api/favorites/toggle
 * ------------------------------------
 * Proxy para adicionar/remover um favorito (cookie httpOnly via
 * handlePost).
 */

import { NextRequest } from 'next/server';
import { handlePost } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  return handlePost(request, '/favorites/toggle', 'Erro ao atualizar favorito');
}
