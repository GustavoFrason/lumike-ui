/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import proxy from '../proxy';
import { COOKIE_NAME } from '@/lib/cookie-name';

const fakeJwt = (payload: object) =>
  ['h', Buffer.from(JSON.stringify(payload)).toString('base64url'), 's'].join('.');

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;

const tokenFor = (role: string | null, exp = inOneHour()) => fakeJwt({ sub: 1, role, exp });

async function visit(path: string, token?: string) {
  const req = new NextRequest(`http://localhost${path}`);
  if (token) req.cookies.set(COOKIE_NAME, token);
  const res = await proxy(req);
  const location = res.headers.get('location');
  return location ? new URL(location).pathname : null;
}

describe('proxy (proteção de rotas)', () => {
  it('sends anonymous users from /admin and /minha-conta to /login', async () => {
    expect(await visit('/admin')).toBe('/login');
    expect(await visit('/minha-conta/pedidos')).toBe('/login');
  });

  it('treats an expired cookie as no session', async () => {
    const expired = tokenFor('admin', 1);
    expect(await visit('/admin', expired)).toBe('/login');
    expect(await visit('/login', expired)).toBeNull();
  });

  it('lets admin/gestor into any admin screen', async () => {
    expect(await visit('/admin/fluxo-caixa', tokenFor('admin'))).toBeNull();
    expect(await visit('/admin', tokenFor('gestor'))).toBeNull();
  });

  it('lets vendedor into the POS only, redirecting other admin screens to it', async () => {
    expect(await visit('/admin/vendas/nova', tokenFor('vendedor'))).toBeNull();
    expect(await visit('/admin/vendas/recibo/5', tokenFor('vendedor'))).toBeNull();
    expect(await visit('/admin/fluxo-caixa', tokenFor('vendedor'))).toBe('/admin/vendas/nova');
  });

  it('sends customers away from the admin to their area', async () => {
    expect(await visit('/admin', tokenFor('customer'))).toBe('/minha-conta');
  });

  it('redirects logged users away from /login according to the role', async () => {
    expect(await visit('/login', tokenFor('admin'))).toBe('/admin');
    expect(await visit('/login', tokenFor('vendedor'))).toBe('/admin/vendas/nova');
    expect(await visit('/login', tokenFor('customer'))).toBe('/minha-conta');
  });

  it('lets any logged user into /minha-conta', async () => {
    expect(await visit('/minha-conta', tokenFor('customer'))).toBeNull();
  });
});
