import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/purchases';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleGet(request, `${BACKEND_PATH}/${id}`, 'Erro ao buscar detalhes da compra');
}
