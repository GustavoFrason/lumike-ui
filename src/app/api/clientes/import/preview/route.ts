/**
 * /api/clientes/import/preview
 * ------------------------------------
 * Proxy para o preview de importação de clientes via planilha Excel.
 * Como o de compras (compras/import/preview), encaminha multipart/form-data
 * — não dá pra usar `handlePost` (serializa o body como JSON).
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyFormData } from '@/lib/api-proxy';
import { createErrorResponse } from '@/lib/api-helpers';

const BACKEND_PATH = '/customer-import';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const response = await proxyFormData(`${BACKEND_PATH}/preview`, formData);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(data.message || 'Erro ao ler a planilha', response.status);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return createErrorResponse('Erro ao ler a planilha', 500, error);
  }
}
