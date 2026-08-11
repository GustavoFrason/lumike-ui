/**
 * /api/users/roles
 * ------------------------------------
 * Proxy para o backend NestJS - Lista de papéis (roles).
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/users/roles';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao buscar papéis');
}
