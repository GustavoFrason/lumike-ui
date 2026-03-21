/**
 * /api/produtos/[id]/images/[imageId]/order
 * ------------------------------------
 * Proxy para atualizar ordem da imagem.
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

const BACKEND_PATH = '/products';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  try {
    const { id, imageId } = await params;
    const body = await request.json();
    const response = await proxyRequest(
      'POST',
      `${BACKEND_PATH}/${id}/images/${imageId}/order`,
      body,
    );
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Erro ao atualizar ordem' },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Erro no POST /api/produtos/[id]/images/[imageId]/order:', error);
    return NextResponse.json({ error: 'Erro ao atualizar ordem.' }, { status: 500 });
  }
}
