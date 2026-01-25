/**
 * /api/clientes
 * ------------------------------------
 * Proxy para o backend NestJS - CRUD de clientes.
 */

import { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/customers';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao buscar clientes');
}

export async function POST(request: NextRequest) {
  return handlePost(request, BACKEND_PATH, 'Erro ao criar cliente');
}

