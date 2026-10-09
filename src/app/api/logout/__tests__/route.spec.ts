/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { clearAuthCookie } from '@/lib/cookies';

jest.mock('@/lib/cookies', () => ({
  clearAuthCookie: jest.fn(),
}));

describe('POST /api/logout', () => {
  it('clears the cookie and redirects (303) to /login on the same origin', async () => {
    const res = await POST(
      new NextRequest('https://loja.lumilee.com.br/api/logout', { method: 'POST' }),
    );

    expect(clearAuthCookie).toHaveBeenCalled();
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://loja.lumilee.com.br/login');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });
});
