/**
 * /api/stock-notifications
 * ------------------------------------
 * Proxy para criar alerta "avise-me". O cookie httpOnly (quando houver)
 * identifica o usuário no backend.
 */

import { NextRequest } from 'next/server';
import { handlePost } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  return handlePost(request, '/stock-notifications', 'Erro ao criar alerta de estoque');
}
