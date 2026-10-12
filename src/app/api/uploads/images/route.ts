/**
 * /api/uploads/images
 * ------------------------------------
 * Proxy para o upload de imagens (produto, categoria, banner). Encaminha
 * o multipart/form-data como está — não dá pra usar `handlePost`, que
 * serializa o body como JSON. O backend valida tipo/tamanho e grava no
 * Storage com a service_role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyFormData } from '@/lib/api-proxy';
import { createErrorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const response = await proxyFormData('/uploads/images', formData);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(data.message || 'Erro ao enviar imagem', response.status);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return createErrorResponse('Erro ao enviar imagem', 500, error);
  }
}
