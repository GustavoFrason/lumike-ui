/**
 * /api/compras/import/confirm
 * ------------------------------------
 * Proxy para confirmar a importação de compra via planilha Excel (Zarpellon).
 */

import { NextRequest } from 'next/server';
import { handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/purchase-import';

export async function POST(request: NextRequest) {
  return handlePost(request, `${BACKEND_PATH}/confirm`, 'Erro ao confirmar importação');
}
