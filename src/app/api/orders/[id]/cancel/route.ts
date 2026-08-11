/**
 * /api/orders/[id]/cancel
 * ------------------------------------
 * Proxy para cancelamento de pedido.
 */

import { NextRequest } from 'next/server';
import { handlePost } from '@/lib/api-helpers';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlePost(request, `/orders/${id}/cancel`, 'Erro ao cancelar pedido');
}
