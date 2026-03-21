/**
 * /api/inventory/products/[id]/history
 * ------------------------------------
 * Proxy para histórico de movimentações.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/inventory/products';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const path = queryString
    ? `${BACKEND_PATH}/${id}/history?${queryString}`
    : `${BACKEND_PATH}/${id}/history`;
  return handleGet(request, path, 'Erro ao buscar histórico');
}
