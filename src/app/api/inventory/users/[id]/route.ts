/**
 * /api/inventory/users/[id]
 * ------------------------------------
 * Proxy para buscar estoque de um usuário específico.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/inventory/users';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleGet(request, `${BACKEND_PATH}/${id}`, 'Erro ao buscar estoque do usuário');
}
