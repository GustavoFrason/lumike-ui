/**
 * /api/dashboard/revenue-history
 * ------------------------------------
 * Proxy para histórico de faturamento do dashboard.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/dashboard';

export async function GET(request: NextRequest) {
  return handleGet(
    request,
    `${BACKEND_PATH}/revenue-history`,
    'Erro ao buscar histórico de faturamento',
  );
}
