/**
 * /api/colecoes
 * ------------------------------------
 * Proxy para o backend NestJS - CRUD de coleções.
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/api-proxy';

const BACKEND_PATH = '/collections';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const path = queryString ? `${BACKEND_PATH}?${queryString}` : BACKEND_PATH;

    const response = await proxyRequest('GET', path);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Erro ao buscar coleções' },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Erro no GET /api/colecoes:', error);
    return NextResponse.json({ error: 'Erro ao buscar coleções.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await proxyRequest('POST', BACKEND_PATH, body);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Erro ao criar coleção' },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro no POST /api/colecoes:', error);
    return NextResponse.json({ error: 'Erro ao criar coleção.' }, { status: 500 });
  }
}
