/**
 * /api/inventory/transfer-batches/preview-all
 * ------------------------------------
 * Proxy: tudo que está com a revendedora, no formato da prévia.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleGet(
    request,
    '/transfer-batches/preview-all',
    'Erro ao buscar o estoque da revendedora',
  );
}
