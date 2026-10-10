/**
 * /api/resellers/[id]/statement
 * ------------------------------------
 * Proxy: extrato do acerto (vendas não acertadas, comissão, a repassar).
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleGet(request, `/resellers/${id}/statement`, 'Erro ao montar o extrato');
}
