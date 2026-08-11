/**
 * /api/inventory/sellers
 * ------------------------------------
 * Proxy para buscar tudo que está com cada revendedor(a), de uma vez.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGet(request, '/inventory/sellers', 'Erro ao buscar estoque dos revendedores');
}
