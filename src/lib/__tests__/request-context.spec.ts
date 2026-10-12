/**
 * @jest-environment node
 */
import { headers } from 'next/headers';
import { getClientForwardHeaders } from '../request-context';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

const mockedHeaders = headers as unknown as jest.Mock;

const withIncoming = (values: Record<string, string>) =>
  mockedHeaders.mockResolvedValue(new Headers(values));

describe('getClientForwardHeaders', () => {
  const ORIGINAL_SECRET = process.env.INTERNAL_PROXY_SECRET;

  afterEach(() => {
    process.env.INTERNAL_PROXY_SECRET = ORIGINAL_SECRET;
    mockedHeaders.mockReset();
  });

  it('forwards x-real-ip with the shared secret', async () => {
    process.env.INTERNAL_PROXY_SECRET = 'segredo';
    withIncoming({ 'x-real-ip': '177.1.2.3' });

    await expect(getClientForwardHeaders()).resolves.toEqual({
      'X-Client-IP': '177.1.2.3',
      'X-Internal-Proxy-Secret': 'segredo',
    });
  });

  it('falls back to the first x-forwarded-for entry', async () => {
    process.env.INTERNAL_PROXY_SECRET = 'segredo';
    withIncoming({ 'x-forwarded-for': '200.10.10.10, 10.0.0.1' });

    const result = await getClientForwardHeaders();
    expect(result['X-Client-IP']).toBe('200.10.10.10');
  });

  it('sends nothing when the secret is not configured', async () => {
    delete process.env.INTERNAL_PROXY_SECRET;
    withIncoming({ 'x-real-ip': '177.1.2.3' });

    await expect(getClientForwardHeaders()).resolves.toEqual({});
  });

  it('sends nothing outside a request (headers() throws)', async () => {
    process.env.INTERNAL_PROXY_SECRET = 'segredo';
    mockedHeaders.mockRejectedValue(new Error('outside request scope'));

    await expect(getClientForwardHeaders()).resolves.toEqual({});
  });
});
