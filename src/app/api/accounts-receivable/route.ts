import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/accounts-receivable';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao buscar contas a receber');
}
