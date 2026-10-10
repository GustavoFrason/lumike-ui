import { computeSelectedTotals, resellersService, StatementOrder } from '../resellers.service';
import { api } from '../../api';

jest.mock('../../api', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const order = (overrides: Partial<StatementOrder>): StatementOrder => ({
  id: 1,
  created_at: '2026-10-01T12:00:00Z',
  customer_name: null,
  total: 0,
  pieces: 1,
  from_her_stock: true,
  is_her_sale: true,
  ...overrides,
});

describe('computeSelectedTotals (mesma conta da API)', () => {
  it('recebido da mala, comissão sobre as vendas dela e a repassar', () => {
    expect(
      computeSelectedTotals(
        [
          order({ id: 1, total: 100 }),
          order({ id: 2, total: 50, pieces: 2 }),
          order({ id: 3, total: 80, from_her_stock: false }),
        ],
        20,
      ),
    ).toEqual({
      orders_count: 3,
      pieces: 4,
      collected: 150,
      commission_base: 230,
      commission: 46,
      amount_due: 104,
    });
  });

  it('sem vendas marcadas tudo zera', () => {
    expect(computeSelectedTotals([], 20).amount_due).toBe(0);
  });
});

describe('resellersService', () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockReset().mockResolvedValue({ data: {} });
    (api.post as jest.Mock).mockReset().mockResolvedValue({ data: { id: 5 } });
  });

  it('getStatement envia o período', async () => {
    await resellersService.getStatement(42, '2026-10-01', '2026-10-31');

    expect(api.get).toHaveBeenCalledWith(
      '/resellers/42/statement?period_start=2026-10-01&period_end=2026-10-31',
    );
  });

  it('createSettlement posta o acerto da revendedora', async () => {
    const input = {
      period_end: '2026-10-31',
      order_ids: [1, 2],
      amount_paid: 80,
      expected_amount_due: 80,
    };

    await expect(resellersService.createSettlement(42, input)).resolves.toEqual({ id: 5 });
    expect(api.post).toHaveBeenCalledWith('/resellers/42/settlements', input);
  });
});
