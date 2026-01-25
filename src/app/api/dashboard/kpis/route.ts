/**
 * /api/dashboard/kpis
 * ------------------------------------
 * Proxy para KPIs do dashboard.
 */

import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';

const BACKEND_PATH = '/dashboard';

export async function GET(request: NextRequest) {
  return handleGet(request, `${BACKEND_PATH}/kpis`, 'Erro ao buscar KPIs');
}

