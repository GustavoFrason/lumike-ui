import { labelSelectionFromPurchase } from '../purchase-labels';
import type { PurchaseWithItems } from '../services/purchases.service';

const product = (id: number, is_active = true) => ({
  id,
  name: `Peça ${id}`,
  sku: String(id),
  sku2: `Z${id}`,
  price: 30,
  preco_promocional: null,
  label_text: null,
  is_active,
});

function purchase(items: PurchaseWithItems['items']): PurchaseWithItems {
  return {
    id: 4,
    supplier_id: 2,
    total_amount: 100,
    notes: null,
    purchase_date: '2026-08-31',
    created_at: '2026-10-08T00:56:55Z',
    updated_at: '2026-10-08T00:56:55Z',
    items_count: items.length,
    suppliers: { name: 'Zarpellon Joias' },
    items,
  };
}

const item = (id: number, productId: number, quantity: number, active = true) => ({
  id,
  product_id: productId,
  quantity,
  unit_cost: 10,
  total_cost: null,
  products: product(productId, active),
});

describe('labelSelectionFromPurchase', () => {
  it('selects one label per purchased piece', () => {
    const selection = labelSelectionFromPurchase(purchase([item(1, 10, 3), item(2, 11, 1)]));

    expect(selection.quantities).toEqual({ 10: 3, 11: 1 });
    expect(selection.pieces).toBe(4);
    expect(selection.products.map((p) => p.id)).toEqual([10, 11]);
  });

  it('adds up repeated lines of the same product', () => {
    const selection = labelSelectionFromPurchase(purchase([item(1, 10, 2), item(2, 10, 5)]));

    expect(selection.quantities).toEqual({ 10: 7 });
    expect(selection.products).toHaveLength(1);
  });

  it('keeps inactive products and counts them', () => {
    const selection = labelSelectionFromPurchase(purchase([item(1, 10, 1), item(2, 11, 2, false)]));

    expect(selection.quantities).toEqual({ 10: 1, 11: 2 });
    expect(selection.inactive).toBe(1);
    expect(selection.products.find((p) => p.id === 11)?.is_active).toBe(false);
  });

  it('skips items whose product no longer exists', () => {
    const selection = labelSelectionFromPurchase(
      purchase([item(1, 10, 1), { ...item(2, 99, 4), products: null }]),
    );

    expect(selection.quantities).toEqual({ 10: 1 });
    expect(selection.pieces).toBe(1);
  });

  it('carries the label fields (name, codes, price, label text)', () => {
    const [p] = labelSelectionFromPurchase(purchase([item(1, 10, 1)])).products;

    expect(p).toMatchObject({ id: 10, name: 'Peça 10', sku: '10', sku2: 'Z10', price: 30 });
  });
});
