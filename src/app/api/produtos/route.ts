/**
 * /api/produtos
 * ------------------------------------
 * Proxy para o backend NestJS - CRUD de produtos.
 */

import { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/products';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao buscar produtos');
}

export async function POST(request: NextRequest) {
  return handlePost(request, BACKEND_PATH, 'Erro ao criar produto');
}
