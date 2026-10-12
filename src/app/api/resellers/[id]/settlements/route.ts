/**
 * /api/resellers/[id]/settlements
 * ------------------------------------
 * Proxy: histórico (GET) e registro (POST) de acertos com a revendedora.
 */

import { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleGet(request, `/resellers/${id}/settlements`, 'Erro ao buscar acertos');
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlePost(request, `/resellers/${id}/settlements`, 'Erro ao registrar acerto');
}
