import {
  buildStockRows,
  EMPTY_STOCK_FILTERS,
  filterStockRows,
  getStockStatus,
  hasActiveStockFilters,
  StockFilters,
  StockRow,
} from '../stock-rows';
import type { Product } from '@/lib/services/products.service';
import type { SellerInventory } from '@/lib/services/inventory.service';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Produto',
    short_description: '',
    price: 10,
    purchase_date: '2026-01-01',
    current_stock: 0,
    min_stock: 0,
    is_active: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  };
}

function buildSeller(
  user_id: number,
  items: { product_id: number; quantity: number }[],
): SellerInventory {
  return {
    user_id,
    name: `Revendedora ${user_id}`,
    total_items: items.reduce((sum, i) => sum + i.quantity, 0),
    items: items.map((i) => ({ ...i, name: 'x', sku: 'x', price: 0 })),
  };
}

const ids = (rows: StockRow[]) => rows.map((r) => r.id);
const filters = (overrides: Partial<StockFilters>): StockFilters => ({
  ...EMPTY_STOCK_FILTERS,
  ...overrides,
});

describe('buildStockRows', () => {
  it('soma o Central com o que está com as revendedoras', () => {
    const [row] = buildStockRows(
      [buildProduct({ id: 1, current_stock: 3 })],
      [
        buildSeller(10, [{ product_id: 1, quantity: 2 }]),
        buildSeller(11, [{ product_id: 1, quantity: 1 }]),
      ],
    );

    expect(row.stock_central).toBe(3);
    expect(row.stock_sellers).toBe(3);
    expect(row.stock_total).toBe(6);
    expect(row.seller_ids).toEqual([10, 11]);
  });

  it('produto sem revendedora fica só com o Central', () => {
    const [row] = buildStockRows([buildProduct({ id: 1, current_stock: 4 })], []);

    expect(row.stock_sellers).toBe(0);
    expect(row.stock_total).toBe(4);
    expect(row.seller_ids).toEqual([]);
  });
});

describe('getStockStatus', () => {
  const statusOf = (current_stock: number, min_stock: number, sellersQty = 0) => {
    const sellers = sellersQty ? [buildSeller(10, [{ product_id: 1, quantity: sellersQty }])] : [];
    const [row] = buildStockRows([buildProduct({ id: 1, current_stock, min_stock })], sellers);
    return getStockStatus(row);
  };

  it('esgotado quando o total é zero', () => {
    expect(statusOf(0, 0)).toBe('out');
  });

  it('estoque baixo quando o total chega no mínimo', () => {
    expect(statusOf(2, 2)).toBe('low');
  });

  it('usa o total: Central zerado mas peça com revendedora não é esgotado', () => {
    expect(statusOf(0, 1, 3)).toBe('normal');
  });
});

describe('filterStockRows', () => {
  const rows = buildStockRows(
    [
      buildProduct({
        id: 1,
        sku: '1',
        name: 'Anel',
        category_id: 5,
        current_stock: 10,
        min_stock: 2,
      }),
      buildProduct({
        id: 2,
        sku: '2',
        name: 'Brinco',
        category_id: 6,
        current_stock: 1,
        min_stock: 2,
      }),
      buildProduct({
        id: 3,
        sku: '3',
        name: 'Colar',
        sku2: 'Z30',
        category_id: 5,
        current_stock: 0,
      }),
      buildProduct({
        id: 4,
        sku: '4',
        name: 'Pulseira',
        category_id: 6,
        current_stock: 0,
        min_stock: 1,
      }),
    ],
    [buildSeller(10, [{ product_id: 4, quantity: 5 }])],
  );

  it('sem filtro devolve tudo em ordem de código', () => {
    expect(ids(filterStockRows(rows, EMPTY_STOCK_FILTERS))).toEqual([1, 2, 3, 4]);
  });

  it('filtra por status', () => {
    expect(ids(filterStockRows(rows, filters({ status: 'out' })))).toEqual([3]);
    expect(ids(filterStockRows(rows, filters({ status: 'low' })))).toEqual([2]);
    expect(ids(filterStockRows(rows, filters({ status: 'normal' })))).toEqual([1, 4]);
  });

  it('filtra por categoria', () => {
    expect(ids(filterStockRows(rows, filters({ categoryId: 6 })))).toEqual([2, 4]);
  });

  it('filtra por local (Central ou revendedora)', () => {
    expect(ids(filterStockRows(rows, filters({ location: 'central' })))).toEqual([1, 2]);
    expect(ids(filterStockRows(rows, filters({ location: 10 })))).toEqual([4]);
    expect(ids(filterStockRows(rows, filters({ location: 99 })))).toEqual([]);
  });

  it('filtra pela faixa de quantidade total (de/até)', () => {
    expect(ids(filterStockRows(rows, filters({ minQty: 5 })))).toEqual([1, 4]);
    expect(ids(filterStockRows(rows, filters({ maxQty: 1 })))).toEqual([2, 3]);
    expect(ids(filterStockRows(rows, filters({ minQty: 1, maxQty: 5 })))).toEqual([2, 4]);
  });

  it('busca por código e por nome', () => {
    expect(ids(filterStockRows(rows, filters({ search: 'z30' })))).toEqual([3]);
    expect(ids(filterStockRows(rows, filters({ search: 'brinco' })))).toEqual([2]);
  });

  it('combina os filtros', () => {
    expect(ids(filterStockRows(rows, filters({ categoryId: 5, status: 'normal' })))).toEqual([1]);
    expect(ids(filterStockRows(rows, filters({ categoryId: 6, location: 'central' })))).toEqual([
      2,
    ]);
  });
});

describe('hasActiveStockFilters', () => {
  it('detecta qualquer filtro preenchido', () => {
    expect(hasActiveStockFilters(EMPTY_STOCK_FILTERS)).toBe(false);
    expect(hasActiveStockFilters(filters({ search: '  ' }))).toBe(false);
    expect(hasActiveStockFilters(filters({ minQty: 0 }))).toBe(true);
    expect(hasActiveStockFilters(filters({ location: 'central' }))).toBe(true);
  });
});
