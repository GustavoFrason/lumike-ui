/**
 * /api/pedidos
 * ------------------------------------
 * Proxy para o backend NestJS - CRUD de pedidos/vendas.
 */

import { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/orders';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao buscar pedidos');
}

export async function POST(request: NextRequest) {
  return handlePost(request, BACKEND_PATH, 'Erro ao criar pedido');
}

