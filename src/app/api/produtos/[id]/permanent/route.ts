/**
 * /api/produtos/[id]/permanent
 * ------------------------------------
 * Proxy para exclusão definitiva de produto (o DELETE de /api/produtos/[id]
 * é soft delete).
 */

import { NextRequest } from 'next/server';
import { handleDelete } from '@/lib/api-helpers';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleDelete('/products', `${id}/permanent`, 'Erro ao excluir produto');
}
