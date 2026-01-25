/**
 * /api/inventory/products/[id]/entry
 * ------------------------------------
 * Proxy para entrada de estoque.
 */

import { NextRequest } from 'next/server';
import { handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/inventory/products';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handlePost(request, `${BACKEND_PATH}/${id}/entry`, 'Erro ao registrar entrada de estoque');
}

