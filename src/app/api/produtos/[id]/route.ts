/**
 * /api/produtos/[id]
 * ------------------------------------
 * Proxy para o backend NestJS - operações em produto específico.
 */

import { NextRequest } from 'next/server';
import { handleGet, handlePatch, handleDelete } from '@/lib/api-helpers';

const BACKEND_PATH = '/products';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const path = queryString ? `${BACKEND_PATH}/${id}?${queryString}` : `${BACKEND_PATH}/${id}`;
  return handleGet(request, path, 'Produto não encontrado');
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlePatch(request, BACKEND_PATH, id, 'Erro ao atualizar produto');
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleDelete(BACKEND_PATH, id, 'Erro ao remover produto');
}
