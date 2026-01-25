/**
 * api-helpers.ts
 * ------------------------------------
 * Funções helper reutilizáveis para operações de API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from './api-proxy';

/**
 * Cria uma resposta de erro padronizada
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  error?: unknown,
): NextResponse {
  if (error) {
    console.error(`[API Error] ${message}:`, error);
  }
  return NextResponse.json({ error: message }, { status });
}

/**
 * Handler genérico para GET requests
 */
export async function handleGet(
  request: NextRequest,
  backendPath: string,
  errorMessage: string = 'Erro ao buscar dados',
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const path = queryString ? `${backendPath}?${queryString}` : backendPath;

    const response = await proxyRequest('GET', path);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(
        data.message || errorMessage,
        response.status,
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return createErrorResponse(errorMessage, 500, error);
  }
}

/**
 * Handler genérico para POST requests
 */
export async function handlePost(
  request: NextRequest,
  backendPath: string,
  errorMessage: string = 'Erro ao criar',
) {
  try {
    const body = await request.json();
    const response = await proxyRequest('POST', backendPath, body);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(
        data.message || errorMessage,
        response.status,
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return createErrorResponse(errorMessage, 500, error);
  }
}

/**
 * Handler genérico para PATCH requests
 */
export async function handlePatch(
  request: NextRequest,
  backendPath: string,
  id: string,
  errorMessage: string = 'Erro ao atualizar',
) {
  try {
    const body = await request.json();
    const response = await proxyRequest('PATCH', `${backendPath}/${id}`, body);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(
        data.message || errorMessage,
        response.status,
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return createErrorResponse(errorMessage, 500, error);
  }
}

/**
 * Handler genérico para DELETE requests
 */
export async function handleDelete(
  backendPath: string,
  id: string,
  errorMessage: string = 'Erro ao remover',
) {
  try {
    const response = await proxyRequest('DELETE', `${backendPath}/${id}`);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(
        data.message || errorMessage,
        response.status,
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return createErrorResponse(errorMessage, 500, error);
  }
}

