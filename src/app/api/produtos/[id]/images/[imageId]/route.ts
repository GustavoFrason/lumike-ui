/**
 * /api/produtos/[id]/images/[imageId]
 * ------------------------------------
 * Proxy para operações em imagem específica.
 */

import { NextRequest } from 'next/server';
import { handleDelete } from '@/lib/api-helpers';

const BACKEND_PATH = '/products';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const { id, imageId } = await params;
  return handleDelete(`${BACKEND_PATH}/${id}/images`, imageId, 'Erro ao remover imagem');
}
