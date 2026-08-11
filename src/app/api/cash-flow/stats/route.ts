/**
 * /api/cash-flow/stats
 * ------------------------------------
 * Proxy para as estatísticas diárias/por categoria do fluxo de caixa.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGet(request, '/cash-flow/stats', 'Erro ao buscar estatísticas de caixa');
}
