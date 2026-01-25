/**
 * /api/settings/[key]
 * ------------------------------------
 * Proxy para o backend NestJS - operações em configuração específica.
 */

import { NextRequest } from 'next/server';
import { handleGet, handlePatch } from '@/lib/api-helpers';

const BACKEND_PATH = '/settings';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ key: string }> },
) {
    const { key } = await params;
    const path = `${BACKEND_PATH}/${key}`;
    return handleGet(request, path, 'Configuração não encontrada');
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ key: string }> },
) {
    const { key } = await params;
    return handlePatch(request, BACKEND_PATH, key, 'Erro ao atualizar configuração');
}
