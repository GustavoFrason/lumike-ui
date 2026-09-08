/**
 * /api/clientes/import/confirm
 * ------------------------------------
 * Proxy para confirmar a importação de clientes via planilha Excel.
 */

import { NextRequest } from 'next/server';
import { handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/customer-import';

export async function POST(request: NextRequest) {
  return handlePost(request, `${BACKEND_PATH}/confirm`, 'Erro ao confirmar importação');
}
