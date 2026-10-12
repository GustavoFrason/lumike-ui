/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { handleGet, handlePatch, handlePost, withSearch } from '../api-helpers';
import { proxyRequest } from '../api-proxy';

jest.mock('../api-proxy', () => ({
  proxyRequest: jest.fn(),
}));

const mockedProxy = proxyRequest as jest.MockedFunction<typeof proxyRequest>;

const okJson = (data: unknown) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const req = (url: string, init?: { method?: string; body?: unknown }) =>
  new NextRequest(`http://localhost${url}`, {
    method: init?.method ?? 'GET',
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

describe('withSearch', () => {
  it('appends the incoming querystring', () => {
    expect(withSearch(req('/api/x?a=1&b=2'), '/x')).toBe('/x?a=1&b=2');
  });

  it('keeps the path untouched when there is no querystring', () => {
    expect(withSearch(req('/api/x'), '/x')).toBe('/x');
  });

  it('does not append again when the route already built its own query', () => {
    expect(withSearch(req('/api/x?limit=5'), '/x?limit=5')).toBe('/x?limit=5');
  });
});

describe('api-helpers handlers', () => {
  beforeEach(() => {
    mockedProxy.mockReset();
    mockedProxy.mockResolvedValue(okJson({ ok: true }));
  });

  it('handleGet forwards the query without duplicating it', async () => {
    await handleGet(req('/api/dashboard/low-stock?limit=5'), '/dashboard/low-stock?limit=5');

    expect(mockedProxy).toHaveBeenCalledWith('GET', '/dashboard/low-stock?limit=5');
  });

  it('handlePost forwards ?userId= to the backend (estoque por revendedora)', async () => {
    const body = { quantity: 3 };
    await handlePost(
      req('/api/inventory/products/9/entry?userId=5', { method: 'POST', body }),
      '/inventory/products/9/entry',
    );

    expect(mockedProxy).toHaveBeenCalledWith('POST', '/inventory/products/9/entry?userId=5', body);
  });

  it('handlePatch forwards the querystring too', async () => {
    const body = { status: 'paid' };
    await handlePatch(req('/api/pedidos/3?x=1', { method: 'PATCH', body }), '/orders', '3');

    expect(mockedProxy).toHaveBeenCalledWith('PATCH', '/orders/3?x=1', body);
  });
});
