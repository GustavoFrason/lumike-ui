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
 * Repassa a querystring da requisição recebida para o backend.
 *
 * Se `backendPath` já tiver `?` (a rota montou a própria query), não
 * acrescenta nada — antes o handleGet sempre concatenava de novo e várias
 * rotas mandavam `/dashboard/low-stock?limit=5?limit=5` (400 no
 * ParseIntPipe). E handlePost/handlePatch descartavam a query, então
 * `?userId=` de entrada/saída de estoque nunca chegava ao backend.
 */
export function withSearch(request: NextRequest, backendPath: string): string {
  if (backendPath.includes('?')) return backendPath;
  return `${backendPath}${request.nextUrl.search}`;
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
    const response = await proxyRequest('GET', withSearch(request, backendPath));
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(data.message || errorMessage, response.status);
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
    const response = await proxyRequest('POST', withSearch(request, backendPath), body);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(data.message || errorMessage, response.status);
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
    const response = await proxyRequest('PATCH', withSearch(request, `${backendPath}/${id}`), body);
    const data = await response.json();

    if (!response.ok) {
      return createErrorResponse(data.message || errorMessage, response.status);
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
      return createErrorResponse(data.message || errorMessage, response.status);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return createErrorResponse(errorMessage, 500, error);
  }
}
