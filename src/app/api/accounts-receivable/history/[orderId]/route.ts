import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';
import { createErrorResponse } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const response = await proxyRequest('GET', `/accounts-receivable/history/${orderId}`);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(
        data.message || 'Erro ao buscar histórico de pagamentos',
        response.status,
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return createErrorResponse('Erro ao buscar histórico de pagamentos', 500, error);
  }
}
