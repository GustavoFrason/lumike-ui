/**
 * /api/users/[id]
 * ------------------------------------
 * Proxy para o backend NestJS - CRUD individual de usuários.
 */

import { NextRequest } from 'next/server';
import { handleGet, handlePatch } from '@/lib/api-helpers';

const BACKEND_PATH = '/users';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGet(request, `${BACKEND_PATH}/${id}`, 'Erro ao buscar usuário');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handlePatch(request, BACKEND_PATH, id, 'Erro ao atualizar usuário');
}
