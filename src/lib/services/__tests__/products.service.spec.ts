import { productsService } from '../products.service';
import { api } from '../../api';

jest.mock('../../api', () => ({
  api: { patch: jest.fn(), delete: jest.fn() },
}));

describe('productsService routes', () => {
  beforeEach(() => {
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
});
