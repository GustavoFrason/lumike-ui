/**
 * /api/users/sellers
 * ------------------------------------
 * Proxy para o backend NestJS - Lista de vendedores.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/users/sellers';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao buscar vendedores');
}
