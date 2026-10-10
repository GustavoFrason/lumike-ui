/**
 * /api/resellers
 * ------------------------------------
 * Proxy: revendedoras com estoque na mala e saldo a acertar.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleGet(request, '/resellers', 'Erro ao listar revendedoras');
}
