/**
 * /api/pedidos/[id]
 * ------------------------------------
 * Proxy para o backend NestJS - operações em pedido específico.
 */

import { NextRequest } from 'next/server';
import { handleGet, handleDelete } from '@/lib/api-helpers';
import { proxyRequest } from '@/lib/api-proxy';

const BACKEND_PATH = '/orders';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const path = queryString ? `${BACKEND_PATH}/${id}?${queryString}` : `${BACKEND_PATH}/${id}`;
  return handleGet(request, path, 'Pedido não encontrado');
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const response = await proxyRequest('PATCH', `${BACKEND_PATH}/${id}/status`, body);
    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data.message || 'Erro ao atualizar pedido' },
        { status: response.status },
      );
    }

    return Response.json(data);
  } catch (error: unknown) {
    console.error('Erro no PATCH /api/pedidos/[id]:', error);
    return Response.json({ error: 'Erro ao atualizar pedido.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleDelete(BACKEND_PATH, id, 'Erro ao remover pedido');
}
