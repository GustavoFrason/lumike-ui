/**
 * /api/cash-flow
 * ------------------------------------
 * Proxy para listar e criar lançamentos de fluxo de caixa.
 */

import { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGet(request, '/cash-flow', 'Erro ao buscar lançamentos de caixa');
}

export async function POST(request: NextRequest) {
  return handlePost(request, '/cash-flow', 'Erro ao criar lançamento de caixa');
}
