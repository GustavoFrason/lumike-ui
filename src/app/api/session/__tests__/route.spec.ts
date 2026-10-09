/**
 * @jest-environment node
 */
import { GET } from '../route';
import { clearAuthCookie, getAuthCookie } from '@/lib/cookies';

jest.mock('@/lib/cookies', () => ({
  getAuthCookie: jest.fn(),
  clearAuthCookie: jest.fn(),
}));

const mockedGet = getAuthCookie as jest.MockedFunction<typeof getAuthCookie>;
const mockedClear = clearAuthCookie as jest.MockedFunction<typeof clearAuthCookie>;

const fakeJwt = (payload: object) =>
  ['header', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'sig'].join('.');

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;

describe('GET /api/session', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedClear.mockReset();
  });

  it('reports unauthenticated (200) without cookie', async () => {
    mockedGet.mockResolvedValue(undefined);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ authenticated: false });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('returns the user from a valid cookie without exposing the token', async () => {
    const token = fakeJwt({ sub: 12, email: 'c@ex.com', role: 'customer', exp: inOneHour() });
    mockedGet.mockResolvedValue(token);

    const res = await GET();
    const body = await res.json();

    expect(body).toEqual({
      authenticated: true,
      user: { id: 12, email: 'c@ex.com', role: 'customer' },
    });
    expect(JSON.stringify(body)).not.toContain(token);
    expect(mockedClear).not.toHaveBeenCalled();
  });

  it('clears an expired cookie and reports unauthenticated', async () => {
    mockedGet.mockResolvedValue(fakeJwt({ sub: 12, exp: 1 }));

    const res = await GET();

    expect(await res.json()).toEqual({ authenticated: false });
    expect(mockedClear).toHaveBeenCalled();
  });

  it('clears an unreadable cookie', async () => {
    mockedGet.mockResolvedValue('lixo');

    const res = await GET();

    expect(await res.json()).toEqual({ authenticated: false });
    expect(mockedClear).toHaveBeenCalled();
  });
});
