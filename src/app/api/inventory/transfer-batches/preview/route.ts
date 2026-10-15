/**
 * /api/inventory/transfer-batches/preview
 * ------------------------------------
 * Proxy para a prévia da transferência em lote (planilha). Encaminha
 * multipart/form-data — não dá pra usar `handlePost` (serializa como JSON).
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyFormData } from '@/lib/api-proxy';
import { createErrorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const response = await proxyFormData('/transfer-batches/preview', formData);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(data.message || 'Erro ao ler a planilha', response.status);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return createErrorResponse('Erro ao ler a planilha', 500, error);
  }
}
