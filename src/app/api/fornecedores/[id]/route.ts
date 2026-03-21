import { NextRequest } from 'next/server';
import { handleGet, handlePatch, handleDelete } from '@/lib/api-helpers';

const BACKEND_PATH = '/suppliers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleGet(request, `${BACKEND_PATH}/${id}`, 'Erro ao buscar fornecedor');
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlePatch(request, BACKEND_PATH, id, 'Erro ao atualizar fornecedor');
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleDelete(BACKEND_PATH, id, 'Erro ao remover fornecedor');
}
