import { ordersService } from '../orders.service';
import { api } from '../../api';

jest.mock('../../api', () => ({
  api: { patch: jest.fn(), post: jest.fn(), get: jest.fn() },
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

describe('ordersService filtros e resumo', () => {
  const mockedGet = api.get as jest.Mock;

  beforeEach(() => {
    mockedGet.mockReset().mockResolvedValue({ data: { data: [], pagination: { total: 0 } } });
  });

  const params = () => new URLSearchParams((mockedGet.mock.calls[0][0] as string).split('?')[1]);

  it('getAll envia vendedora, estoque de origem e período', async () => {
    await ordersService.getAll(1, 20, 'completed', undefined, {
      sellerId: 'none',
      stockLocation: 'central',
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    });

    expect(params().get('status')).toBe('completed');
    expect(params().get('seller_id')).toBe('none');
    expect(params().get('stock_location')).toBe('central');
    expect(params().get('date_from')).toBe('2026-10-01');
    expect(params().get('date_to')).toBe('2026-10-31');
  });

  it('getSummary usa a rota de resumo com os mesmos filtros', async () => {
    await ordersService.getSummary({ sellerId: 42 });

    expect(mockedGet).toHaveBeenCalledWith('/pedidos/summary?seller_id=42');
  });

  it('getSummary sem filtros não manda querystring', async () => {
    await ordersService.getSummary();

    expect(mockedGet).toHaveBeenCalledWith('/pedidos/summary');
  });
});
