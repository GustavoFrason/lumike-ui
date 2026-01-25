/**
 * /api/dashboard/top-sellers
 * ------------------------------------
 * Proxy para produtos mais vendidos.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/dashboard';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const path = queryString
    ? `${BACKEND_PATH}/top-sellers?${queryString}`
    : `${BACKEND_PATH}/top-sellers`;
  return handleGet(request, path, 'Erro ao buscar produtos mais vendidos');
}

