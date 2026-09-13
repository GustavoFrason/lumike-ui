import { generateLabelsZpl } from '../label-zpl.service';
import { DEFAULT_LABEL_CONFIG } from '@/app/admin/produtos/etiquetas/components/types';
import type { Product } from '@/lib/services/products.service';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    sku: 'ABC123',
    name: 'Anel Solitário',
    short_description: '',
    price: 30,
    purchase_date: '2026-01-01',
    current_stock: 10,
    min_stock: 1,
    is_active: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  };
}

describe('generateLabelsZpl', () => {
  it('lista vazia gera ZPL vazio (nenhum job pra impressora nenhuma)', () => {
    expect(generateLabelsZpl([], DEFAULT_LABEL_CONFIG)).toBe('');
  });

  it('agrupa em uma fileira (um bloco ^XA...^XZ) quando cabe tudo em columnsPerRow', () => {
    const products = [buildProduct({ id: 1 }), buildProduct({ id: 2 }), buildProduct({ id: 3 })];
    const zpl = generateLabelsZpl(products, DEFAULT_LABEL_CONFIG); // columnsPerRow: 3

    expect(zpl.match(/\^XA/g)).toHaveLength(1);
    expect(zpl.match(/\^XZ/g)).toHaveLength(1);
    expect(zpl.match(/\^BQN,2,/g)).toHaveLength(3); // um QR por produto
  });

  it('quebra em duas fileiras (dois blocos ^XA...^XZ) quando excede columnsPerRow', () => {
    const products = [1, 2, 3, 4].map((id) => buildProduct({ id }));
    const zpl = generateLabelsZpl(products, DEFAULT_LABEL_CONFIG); // columnsPerRow: 3 -> 3 + 1

    expect(zpl.match(/\^XA/g)).toHaveLength(2);
    expect(zpl.match(/\^XZ/g)).toHaveLength(2);
    expect(zpl.match(/\^BQN,2,/g)).toHaveLength(4);
  });

  it('declara UTF-8 (^CI28) em cada fileira — acento em nome de produto depende disso', () => {
    const zpl = generateLabelsZpl([buildProduct()], DEFAULT_LABEL_CONFIG);
    expect(zpl).toContain('^CI28');
  });

  it('usa o SKU como conteúdo do QR, com o nível de correção de erro L (mesmo do preview)', () => {
    const zpl = generateLabelsZpl([buildProduct({ sku: 'XYZ-9' })], DEFAULT_LABEL_CONFIG);
    expect(zpl).toContain('^FDLA,XYZ-9^FS');
  });

  it('usa o id do produto quando não há SKU', () => {
    const zpl = generateLabelsZpl([buildProduct({ id: 42, sku: undefined })], DEFAULT_LABEL_CONFIG);
    expect(zpl).toContain('^FDLA,42^FS');
  });

  it('mostra o preço promocional (sem o riscado do preço cheio — ZPL não tem line-through nativo)', () => {
    const zpl = generateLabelsZpl(
      [buildProduct({ price: 100, preco_promocional: 79.9 })],
      DEFAULT_LABEL_CONFIG,
    );
    expect(zpl).toContain('79,90');
    expect(zpl).not.toContain('100,00');
  });

  it('mostra o preço cheio quando não há promocional', () => {
    const zpl = generateLabelsZpl([buildProduct({ price: 30 })], DEFAULT_LABEL_CONFIG);
    expect(zpl).toContain('30,00');
  });

  it('não inclui nome do produto quando showProductName está desligado (default)', () => {
    const zpl = generateLabelsZpl(
      [buildProduct({ name: 'Colar Especial' })],
      DEFAULT_LABEL_CONFIG,
    );
    expect(zpl).not.toContain('Colar Especial');
  });

  it('inclui nome do produto quando showProductName está ligado', () => {
    const zpl = generateLabelsZpl(
      [buildProduct({ name: 'Colar Especial' })],
      { ...DEFAULT_LABEL_CONFIG, showProductName: true },
    );
    expect(zpl).toContain('Colar Especial');
  });

  it('remove caracteres delimitadores de comando ZPL (^ ~ \\) de SKU/nome pra não quebrar o job', () => {
    const zpl = generateLabelsZpl(
      [buildProduct({ sku: 'A^B~C\\D' })],
      DEFAULT_LABEL_CONFIG,
    );
    expect(zpl).toContain('^FDLA,ABCD^FS');
  });
});
