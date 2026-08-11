/**
 * /api/inventory/products/[id]/transfer
 * ------------------------------------
 * Proxy para transferência de estoque entre localidades/revendedores.
 */

import { NextRequest } from 'next/server';
import { handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/inventory/products';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlePost(request, `${BACKEND_PATH}/${id}/transfer`, 'Erro ao transferir estoque');
}
