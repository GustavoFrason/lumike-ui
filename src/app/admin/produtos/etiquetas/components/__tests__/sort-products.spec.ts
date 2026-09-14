import { compareProductsBySku } from '../sort-products';
import type { Product } from '@/lib/services/products.service';

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

describe('compareProductsBySku', () => {
  it('ordena por sku crescente', () => {
    const products = [
      buildProduct({ id: 1, sku: '205' }),
      buildProduct({ id: 2, sku: '3' }),
      buildProduct({ id: 3, sku: '100' }),
    ];

    const sorted = [...products].sort(compareProductsBySku);

    expect(sorted.map((p) => p.sku)).toEqual(['3', '100', '205']);
  });

  it('compara como número, não como texto (9 antes de 10)', () => {
    const products = [buildProduct({ sku: '10' }), buildProduct({ sku: '9' })];

    const sorted = [...products].sort(compareProductsBySku);

    // Comparação de string colocaria "10" antes de "9" — teste falharia
    // se a implementação regredisse pra isso.
    expect(sorted.map((p) => p.sku)).toEqual(['9', '10']);
  });

  it('produto sem sku (ou não numérico) vai pro final, ordenado por id entre si', () => {
    const products = [
      buildProduct({ id: 3, sku: undefined }),
      buildProduct({ id: 1, sku: '5' }),
      buildProduct({ id: 2, sku: undefined }),
    ];

    const sorted = [...products].sort(compareProductsBySku);

    expect(sorted.map((p) => p.id)).toEqual([1, 2, 3]);
  });
});
