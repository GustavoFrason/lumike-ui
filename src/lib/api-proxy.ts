/**
 * api-proxy.ts
 * ------------------------------------
 * Função helper para fazer proxy de requisições ao backend NestJS.
 * Lê o token do cookie httpOnly e adiciona no header Authorization.
 */

import { getAuthCookie } from './cookies';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function proxyRequest(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<Response> {
  const token = await getAuthCookie();

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn(`[API Proxy] Token não encontrado para requisição ${method} ${path}`);
  }

  const options: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BACKEND_URL}${path}`, options);

  // Se receber 401, loga para debug
  if (response.status === 401) {
    console.error(`[API Proxy] 401 Unauthorized para ${method} ${path}`, {
      hasToken: !!token,
      tokenLength: token?.length,
    });
  }

  return response;
}

