/**
 * /api/produtos/slug/[slug]
 * ------------------------------------
 * Proxy para buscar produto por slug.
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

const BACKEND_PATH = '/products';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const response = await proxyRequest('GET', `${BACKEND_PATH}/slug/${slug}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Produto não encontrado' },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Erro no GET /api/produtos/slug/[slug]:', error);
    return NextResponse.json({ error: 'Erro ao buscar produto.' }, { status: 500 });
  }
}
