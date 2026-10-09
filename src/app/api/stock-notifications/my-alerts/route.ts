/**
 * /api/stock-notifications/my-alerts
 * ------------------------------------
 * Proxy para os alertas de estoque do usuário logado (cookie httpOnly).
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleGet(request, '/stock-notifications/my-alerts', 'Erro ao buscar alertas');
}
