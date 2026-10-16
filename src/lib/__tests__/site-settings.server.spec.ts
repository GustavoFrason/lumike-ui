import { getSiteSettings } from '../site-settings.server';
import { fetchServer } from '../api-server';

jest.mock('../api-server', () => ({ fetchServer: jest.fn() }));

const mockedFetch = fetchServer as jest.MockedFunction<typeof fetchServer>;

describe('getSiteSettings', () => {
  beforeEach(() => mockedFetch.mockReset());

  it('keeps only key and value of each setting', async () => {
    mockedFetch.mockResolvedValue([
      { key: 'whatsapp_number', value: '5511987654321', description: 'x', updated_at: 'y' },
    ]);

    await expect(getSiteSettings()).resolves.toEqual([
      { key: 'whatsapp_number', value: '5511987654321' },
    ]);
    expect(mockedFetch).toHaveBeenCalledWith(
      '/settings',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('is null when the API fails, so the provider loads them in the browser', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedFetch.mockRejectedValue(new Error('timeout'));

    await expect(getSiteSettings()).resolves.toBeNull();
  });
});
