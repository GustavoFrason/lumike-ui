import * as XLSX from 'xlsx';
import { exportProductsToExcel } from '../export-products';
import type { Product } from '@/lib/services/products.service';

jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(() => ({})),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Anel Solitário',
    short_description: 'Anel',
    price: 100,
    purchase_date: '2026-01-01',
    current_stock: 5,
    min_stock: 1,
    is_active: true,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-02T10:00:00Z',
    ...overrides,
  };
}

describe('exportProductsToExcel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mapeia todos os campos do produto pra colunas em português', () => {
    const product = buildProduct({
      sku: 'ABC1',
      sku2: 'ZAR1',
      description: 'Descrição completa',
      slug: 'anel-solitario',
      categories: { id: 3, name: 'Anéis' },
      category_id: 3,
      supplier_id: 7,
      collection: 'Verão 2026',
      colecao_id: 'col-1',
      preco_promocional: 79.9,
      cost_price: 30,
      is_featured: true,
    });

    exportProductsToExcel([product]);

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
      expect.objectContaining({
        ID: 1,
        SKU: 'ABC1',
        'SKU Zarpellon': 'ZAR1',
        Nome: 'Anel Solitário',
        Descrição: 'Descrição completa',
        Slug: 'anel-solitario',
        Categoria: 'Anéis',
        'ID Categoria': 3,
        'ID Fornecedor': 7,
        Coleção: 'Verão 2026',
        'ID Coleção': 'col-1',
        Preço: 100,
        'Preço Promocional': 79.9,
        'Preço de Custo': 30,
        'Estoque Atual': 5,
        'Estoque Mínimo': 1,
        Ativo: 'Sim',
        Destaque: 'Sim',
      }),
    ]);
  });

  it('campos opcionais ausentes viram string vazia, não undefined/erro', () => {
    const product = buildProduct(); // sem sku, sku2, categories, preco_promocional...

    exportProductsToExcel([product]);

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
      expect.objectContaining({
        SKU: '',
        'SKU Zarpellon': '',
        Categoria: '',
        'Preço Promocional': '',
        'Preço de Custo': '',
        Ativo: 'Sim',
        Destaque: 'Não',
      }),
    ]);
  });

  it('gera e baixa o arquivo com nome datado', () => {
    exportProductsToExcel([buildProduct()]);

    expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringMatching(/^produtos-\d{4}-\d{2}-\d{2}\.xlsx$/),
    );
  });

  it('lista vazia não quebra (gera planilha só com cabeçalho)', () => {
    expect(() => exportProductsToExcel([])).not.toThrow();
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([]);
  });
});
