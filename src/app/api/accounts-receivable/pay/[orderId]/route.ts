import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';
import { createErrorResponse } from '@/lib/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const response = await proxyRequest('POST', `/accounts-receivable/pay/${orderId}`, body);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(data.message || 'Erro ao registrar pagamento', response.status);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return createErrorResponse('Erro ao registrar pagamento', 500, error);
  }
}
