/**
 * /api/produtos/lookup
 * ------------------------------------
 * Proxy para a busca exata por código (sku, sku2, código Zarpellon 2 ou
 * id). Rota estática: tem precedência sobre /api/produtos/[id].
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleGet(request, '/products/lookup', 'Erro ao buscar produto por código');
}
