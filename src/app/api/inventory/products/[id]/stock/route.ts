/**
 * /api/inventory/products/[id]/stock
 * ------------------------------------
 * Proxy para estoque atual.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/inventory/products';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleGet(request, `${BACKEND_PATH}/${id}/stock`, 'Erro ao buscar estoque');
}
