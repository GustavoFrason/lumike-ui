import { ordersService } from '../orders.service';
import { api } from '../../api';

jest.mock('../../api', () => ({
  api: { patch: jest.fn(), post: jest.fn() },
}));

const mockedPatch = api.patch as jest.Mock;
const mockedPost = api.post as jest.Mock;

describe('ordersService', () => {
  beforeEach(() => {
    mockedPatch.mockReset().mockResolvedValue({ data: { id: 3 } });
    mockedPost.mockReset().mockResolvedValue({ data: { id: 3 } });
  });

  it('updateStatus calls the existing Next route PATCH /pedidos/:id', async () => {
    await ordersService.updateStatus(3, 'completed');

    expect(mockedPatch).toHaveBeenCalledWith('/pedidos/3', { status: 'completed' });
  });

  it('cancel posts the refund to /orders/:id/cancel', async () => {
    await ordersService.cancel(3, { refundAmount: 50, notes: 'desistiu' });

    expect(mockedPost).toHaveBeenCalledWith('/orders/3/cancel', {
      refundAmount: 50,
      notes: 'desistiu',
    });
  });

  it('cancel propagates backend errors (no more fake "success")', async () => {
    mockedPost.mockRejectedValueOnce(new Error('Pedido já cancelado'));

    await expect(ordersService.cancel(3, { refundAmount: 0 })).rejects.toThrow(
      'Pedido já cancelado',
    );
  });
});
