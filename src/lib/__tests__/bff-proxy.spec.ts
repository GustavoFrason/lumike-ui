/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { forwardToBackend } from '../bff-proxy';
import { getAuthCookie } from '../cookies';

jest.mock('../cookies', () => ({ getAuthCookie: jest.fn() }));
jest.mock('../request-context', () => ({
  getClientForwardHeaders: jest.fn().mockResolvedValue({ 'X-Client-IP': '1.2.3.4' }),
}));

const mockedToken = getAuthCookie as jest.MockedFunction<typeof getAuthCookie>;
const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

const req = (url: string, init?: ConstructorParameters<typeof NextRequest>[1]) =>
  new NextRequest(`http://localhost${url}`, init);

const lastCall = () => {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
  return { url, init, headers: new Headers(init.headers) };
};

beforeEach(() => {
  process.env.API_URL = 'http://api.test';
  fetchMock.mockReset().mockResolvedValue(json({ ok: true }));
  global.fetch = fetchMock as unknown as typeof fetch;
  mockedToken.mockReset().mockResolvedValue('jwt-123');
});

afterAll(() => {
  delete process.env.API_URL;
});

describe('forwardToBackend', () => {
  it('forwards a GET with the querystring, the session token and the client IP', async () => {
    const res = await forwardToBackend(req('/api/produtos?search=anel&page=2'), ['produtos']);

    const { url, init, headers } = lastCall();
    expect(url).toBe('http://api.test/products?search=anel&page=2');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect(headers.get('Authorization')).toBe('Bearer jwt-123');
    expect(headers.get('X-Client-IP')).toBe('1.2.3.4');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('goes without Authorization for an anonymous visitor', async () => {
    mockedToken.mockResolvedValue(undefined);
    await forwardToBackend(req('/api/produtos'), ['produtos']);

    expect(lastCall().headers.has('Authorization')).toBe(false);
  });

  it('forwards a JSON body as is and keeps the backend status', async () => {
    fetchMock.mockResolvedValue(json({ id: 3 }, 201));
    const body = JSON.stringify({ name: 'Anel' });

    const res = await forwardToBackend(
      req('/api/produtos', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
      ['produtos'],
    );

    const { init, headers } = lastCall();
    expect(init.method).toBe('POST');
    expect(Buffer.from(init.body as ArrayBuffer).toString()).toBe(body);
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(res.status).toBe(201);
  });

  it('forwards multipart uploads with the original boundary', async () => {
    const form = new FormData();
    form.append('file', new Blob(['xlsx-bytes']), 'compra.xlsx');
    const incoming = new Request('http://localhost/api/compras/import/preview', {
      method: 'POST',
      body: form,
    });
    const contentType = incoming.headers.get('content-type')!;

    await forwardToBackend(
      req('/api/compras/import/preview', {
        method: 'POST',
        body: await incoming.arrayBuffer(),
        headers: { 'Content-Type': contentType },
      }),
      ['compras', 'import', 'preview'],
    );

    const { url, init, headers } = lastCall();
    expect(url).toBe('http://api.test/purchase-import/preview');
    expect(headers.get('Content-Type')).toBe(contentType);
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(Buffer.from(init.body as ArrayBuffer).toString()).toContain('xlsx-bytes');
  });

  it('answers 404 for a prefix outside the table without calling the backend', async () => {
    const res = await forwardToBackend(req('/api/auth/login'), ['auth', 'login']);

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Rota não encontrada.' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('turns a backend error into { error } with the same status', async () => {
    fetchMock.mockResolvedValue(json({ statusCode: 400, message: 'Estoque insuficiente' }, 400));

    const res = await forwardToBackend(req('/api/pedidos', { method: 'POST' }), ['pedidos']);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Estoque insuficiente' });
  });

  it('joins validation errors into one message', async () => {
    fetchMock.mockResolvedValue(
      json(
        { statusCode: 400, message: ['name should not be empty', 'price must be a number'] },
        400,
      ),
    );

    const res = await forwardToBackend(req('/api/produtos', { method: 'POST' }), ['produtos']);

    expect(await res.json()).toEqual({
      error: 'name should not be empty; price must be a number',
    });
  });

  it('keeps 401 so the client interceptor ends the session', async () => {
    fetchMock.mockResolvedValue(json({ statusCode: 401, message: 'Unauthorized' }, 401));

    const res = await forwardToBackend(req('/api/users'), ['users']);

    expect(res.status).toBe(401);
  });

  it('answers 204 and empty bodies without a body', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const noContent = await forwardToBackend(req('/api/produtos/9', { method: 'DELETE' }), [
      'produtos',
      '9',
    ]);
    expect(noContent.status).toBe(204);
    expect(await noContent.text()).toBe('');

    fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }));
    const empty = await forwardToBackend(req('/api/produtos/9', { method: 'DELETE' }), [
      'produtos',
      '9',
    ]);
    expect(empty.status).toBe(200);
    expect(await empty.text()).toBe('');
  });

  it('answers 502 when the API is unreachable', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    const res = await forwardToBackend(req('/api/produtos'), ['produtos']);

    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/servidor/);
  });
});
