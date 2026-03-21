import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/warranties/stats';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao buscar estatísticas de garantias');
}
