import { compareProductsBySku, rankProductsForSearch } from '../sort-products';
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

describe('rankProductsForSearch', () => {
  const catalog = [
    buildProduct({ id: 1, sku: '1', name: 'Brinco 7mm', sku2: 'Z100' }),
    buildProduct({ id: 7, sku: '7', name: 'Anel', sku2: 'Z200' }),
    buildProduct({ id: 17, sku: '17', name: 'Colar', sku2: 'Z300' }),
    buildProduct({ id: 70, sku: '70', name: 'Pulseira', sku2: 'Z7' }),
    buildProduct({ id: 71, sku: '71', name: 'Tornozeleira', sku2: 'X1', sku2_alt: 'Z7B' }),
    buildProduct({ id: 9, sku: '9', name: 'Argola', sku2: 'Q9', label_text: 'ARO 17' }),
  ];
  const ids = (list: Product[]) => list.map((p) => p.id);

  it('puts the exact item number first, then prefixes, then contains', () => {
    // 7 exato → 70, 71 (começam com 7) → contém 7, em ordem: 1 ("7mm"), 9 ("ARO 17"), 17
    expect(ids(rankProductsForSearch(catalog, '7'))).toEqual([7, 70, 71, 1, 9, 17]);
  });

  it('ignores spaces around the term ("7 " finds item 7)', () => {
    expect(ids(rankProductsForSearch(catalog, ' 7 '))[0]).toBe(7);
  });

  it('matches the Zarpellon code and the second code, exact before prefix', () => {
    expect(ids(rankProductsForSearch(catalog, 'z7'))).toEqual([70, 71]);
    expect(ids(rankProductsForSearch(catalog, 'Z7B'))).toEqual([71]);
  });

  it('also finds by label text', () => {
    expect(ids(rankProductsForSearch(catalog, 'aro 17'))).toEqual([9]);
  });

  it('returns everything in item-number order for an empty term', () => {
    expect(ids(rankProductsForSearch(catalog, '   '))).toEqual([1, 7, 9, 17, 70, 71]);
  });
});
