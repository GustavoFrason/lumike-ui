/**
 * bff-proxy.ts
 * ------------------------------------
 * Só servidor. Repassa uma chamada `/api/...` do navegador para a
 * lumike-api, com o token do cookie httpOnly no `Authorization` e o IP do
 * visitante para o rate limit (ver request-context.ts).
 *
 * Resposta para o navegador:
 * - sucesso: o corpo e o status do backend, como vieram;
 * - erro: `{ error: mensagem }` com o status do backend, que é o formato
 *   que `getErrorMessage` e `useApi` leem.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from './cookies';
import { getClientForwardHeaders } from './request-context';
import { getBackendUrl } from './backend-url';
import { backendErrorMessage, resolveBackendPath } from './bff-routes';

const GENERIC_ERROR = 'Erro ao comunicar com o servidor.';

/** Status que não podem ter corpo. */
const NO_BODY = new Set([204, 205, 304]);

export async function forwardToBackend(
  request: NextRequest,
  segments: string[],
): Promise<NextResponse> {
  const backendPath = resolveBackendPath(segments);
  if (!backendPath) {
    return NextResponse.json({ error: 'Rota não encontrada.' }, { status: 404 });
  }

  const headers = new Headers(await getClientForwardHeaders());
  const token = await getAuthCookie();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // Corpo cru, sem parse: JSON e multipart (upload de imagem, planilhas)
  // seguem pelo mesmo caminho, com o Content-Type original, que leva o
  // boundary do multipart.
  let body: ArrayBuffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const raw = await request.arrayBuffer();
    if (raw.byteLength > 0) {
      body = raw;
      const contentType = request.headers.get('content-type');
      if (contentType) headers.set('Content-Type', contentType);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}${backendPath}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });
  } catch (error) {
    console.error(`[BFF] ${request.method} ${backendPath}: API inacessível`, error);
    return NextResponse.json(
      { error: 'Não foi possível falar com o servidor. Tente de novo em instantes.' },
      { status: 502 },
    );
  }

  return toClientResponse(response);
}

async function toClientResponse(response: Response): Promise<NextResponse> {
  const { status } = response;
  const text = NO_BODY.has(status) ? '' : await response.text();

  if (!text) {
    return response.ok
      ? new NextResponse(null, { status })
      : NextResponse.json({ error: GENERIC_ERROR }, { status });
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    return NextResponse.json({ error: backendErrorMessage(data, GENERIC_ERROR) }, { status });
  }

  if (data === undefined) {
    // Sucesso que não é JSON: repassa como veio.
    return new NextResponse(text, {
      status,
      headers: { 'Content-Type': response.headers.get('content-type') ?? 'text/plain' },
    });
  }

  return NextResponse.json(data, { status });
}
