import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/suppliers/roi-analysis';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao carregar análise de ROI');
}
