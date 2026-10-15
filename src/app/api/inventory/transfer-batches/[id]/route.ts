/**
 * /api/inventory/transfer-batches/[id]
 * ------------------------------------
 * Proxy: lote + peças, para o romaneio.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleGet(request, `/transfer-batches/${id}`, 'Erro ao buscar a transferência');
}
