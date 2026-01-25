/**
 * /api/produtos/[id]/images
 * ------------------------------------
 * Proxy para gestão de imagens de produtos.
 */

import { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/products';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleGet(request, `${BACKEND_PATH}/${id}/images`, 'Erro ao buscar imagens');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handlePost(request, `${BACKEND_PATH}/${id}/images`, 'Erro ao registrar imagem');
}

