/**
 * /api/inventory/products/[id]/adjustment
 * ------------------------------------
 * Proxy para conferência física de estoque (bate contagem manual x sistema).
 */

import { NextRequest } from 'next/server';
import { handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/inventory/products';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlePost(request, `${BACKEND_PATH}/${id}/adjustment`, 'Erro ao registrar conferência de estoque');
}
