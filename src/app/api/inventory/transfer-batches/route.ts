/**
 * /api/inventory/transfer-batches
 * ------------------------------------
 * Proxy: histórico de transferências em lote (GET) e confirmação de uma
 * nova transferência (POST).
 */

import { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const BACKEND_PATH = '/transfer-batches';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao listar as transferências');
}

export async function POST(request: NextRequest) {
  return handlePost(request, BACKEND_PATH, 'Erro ao transferir as peças');
}
