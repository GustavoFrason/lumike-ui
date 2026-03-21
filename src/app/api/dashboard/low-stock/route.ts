/**
 * /api/dashboard/low-stock
 * ------------------------------------
 * Proxy para alertas de estoque baixo.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/dashboard';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const path = queryString
    ? `${BACKEND_PATH}/low-stock?${queryString}`
    : `${BACKEND_PATH}/low-stock`;
  return handleGet(request, path, 'Erro ao buscar alertas de estoque');
}
