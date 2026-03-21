/**
 * /api/settings
 * ------------------------------------
 * Proxy para o backend NestJS - lista de configurações.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/settings';

export async function GET(request: NextRequest) {
  return handleGet(request, BACKEND_PATH, 'Erro ao buscar configurações');
}
