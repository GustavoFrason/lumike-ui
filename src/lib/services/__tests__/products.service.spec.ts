import { productsService, MAX_PRODUCTS_PER_REQUEST } from '../products.service';
import { api } from '../../api';

jest.mock('../../api', () => ({
  api: { get: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const mockedGet = api.get as jest.Mock;

const page = (ids: number[], total: number) => ({
  data: { data: ids.map((id) => ({ id, name: `P${id}` })), pagination: { total } },
});

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

describe('productsService routes', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    (api.patch as jest.Mock).mockReset().mockResolvedValue({ data: {} });
    (api.delete as jest.Mock).mockReset().mockResolvedValue({ data: {} });
  });

  it('bulkUpdateStatus uses the existing Next route /produtos/bulk-status', async () => {
    await productsService.bulkUpdateStatus([1, 2], false);

    expect(api.patch).toHaveBeenCalledWith('/produtos/bulk-status', {
      ids: [1, 2],
      is_active: false,
    });
  });

  it('delete (permanent) uses /produtos/:id/permanent', async () => {
    await productsService.delete(9);

    expect(api.delete).toHaveBeenCalledWith('/produtos/9/permanent');
  });

  it('getAll trims the search term and forwards sort', async () => {
    mockedGet.mockResolvedValue(page([], 0));

    await productsService.getAll(1, 20, true, ' 7 ', undefined, undefined, 'code');

    const url = mockedGet.mock.calls[0][0] as string;
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('search')).toBe('7');
    expect(params.get('sort')).toBe('code');
  });

  it('lookup calls the exact-code route', async () => {
    mockedGet.mockResolvedValue({ data: [] });

    await productsService.lookup(' AB12 ', true);

    expect(mockedGet).toHaveBeenCalledWith('/produtos/lookup?code=AB12&active_only=true');
  });

  describe('getAllPages', () => {
    it('pages through 1000 at a time until the total (Supabase max_rows)', async () => {
      mockedGet
        .mockResolvedValueOnce(page(range(1, 1000), 2500))
        .mockResolvedValueOnce(page(range(1001, 2000), 2500))
        .mockResolvedValueOnce(page(range(2001, 2500), 2500));
      const progress = jest.fn();

      const all = await productsService.getAllPages({ isActive: true }, progress);

      expect(all).toHaveLength(2500);
      expect(mockedGet).toHaveBeenCalledTimes(3);
      const firstUrl = mockedGet.mock.calls[0][0] as string;
      expect(firstUrl).toContain(`limit=${MAX_PRODUCTS_PER_REQUEST}`);
      expect(firstUrl).toContain('sort=code');
      expect(progress).toHaveBeenLastCalledWith(2500, 2500);
    });

    it('stops on a short page and dedupes ids repeated by exact-match prepends', async () => {
      mockedGet.mockResolvedValueOnce(page([7, 1, 7, 17], 3));

      const all = await productsService.getAllPages({ search: '7' });

      expect(all.map((p) => p.id)).toEqual([7, 1, 17]);
      expect(mockedGet).toHaveBeenCalledTimes(1);
    });
  });
});
