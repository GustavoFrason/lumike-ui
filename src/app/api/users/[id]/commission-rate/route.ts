/**
 * /api/users/[id]/commission-rate
 * ------------------------------------
 * Proxy para o backend NestJS - Atualização de taxa de comissão.
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';
import { createErrorResponse } from '@/lib/api-helpers';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const response = await proxyRequest('PATCH', `/users/${id}/commission-rate`, body);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(data.message || 'Erro ao atualizar comissão', response.status);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return createErrorResponse('Erro ao atualizar comissão', 500, error);
  }
}
