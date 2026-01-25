/**
 * /api/categorias/slug/[slug]
 * ------------------------------------
 * Proxy para buscar categoria por slug.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/categories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return handleGet(request, `${BACKEND_PATH}/slug/${slug}`, 'Categoria não encontrada');
}

