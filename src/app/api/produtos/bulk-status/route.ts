/**
 * /api/produtos/bulk-status
 * ------------------------------------
 * Proxy para ativar/desativar vários produtos de uma vez.
 * Rota estática: tem precedência sobre /api/produtos/[id].
 */

import { NextRequest } from 'next/server';
import { handlePatch } from '@/lib/api-helpers';

export async function PATCH(request: NextRequest) {
  return handlePatch(request, '/products', 'bulk-status', 'Erro ao atualizar status dos produtos');
}
