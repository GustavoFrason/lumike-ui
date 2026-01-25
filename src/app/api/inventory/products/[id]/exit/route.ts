/**
 * /api/inventory/products/[id]/exit
 * ------------------------------------
 * Proxy para saída de estoque.
 */

import { NextRequest } from 'next/server';
import { handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/inventory/products';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handlePost(request, `${BACKEND_PATH}/${id}/exit`, 'Erro ao registrar saída de estoque');
}

