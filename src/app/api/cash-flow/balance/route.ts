/**
 * /api/cash-flow/balance
 * ------------------------------------
 * Proxy para o saldo atual do fluxo de caixa.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGet(request, '/cash-flow/balance', 'Erro ao buscar saldo de caixa');
}
