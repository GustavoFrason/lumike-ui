import { NextRequest } from 'next/server';
import { handleGet, handlePost } from '@/lib/api-helpers';

const BACKEND_PATH = '/suppliers';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao buscar fornecedores');
}

export async function POST(request: NextRequest) {
  return handlePost(request, BACKEND_PATH, 'Erro ao criar fornecedor');
}
