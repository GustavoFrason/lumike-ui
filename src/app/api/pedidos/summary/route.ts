/**
 * /api/pedidos/summary
 * ------------------------------------
 * Proxy para o resumo de vendas por vendedora e por estoque de origem.
 * Rota estática: tem precedência sobre /api/pedidos/[id].
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleGet(request, '/orders/summary', 'Erro ao calcular resumo de vendas');
}
