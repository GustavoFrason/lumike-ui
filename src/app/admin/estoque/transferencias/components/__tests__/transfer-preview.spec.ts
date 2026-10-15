import {
  batchLocationLabel,
  CENTRAL_LABEL,
  formatRowNumbers,
  locationLabel,
  parseLocationParam,
  removeItem,
  setItemQuantity,
  summarizeItems,
} from '../transfer-preview';
import type { TransferBatchItemPreview } from '@/lib/services/transfer-batches.service';

function item(overrides: Partial<TransferBatchItemPreview> = {}): TransferBatchItemPreview {
  return {
    product_id: 1,
    sku: '1',
    sku2: null,
    name: 'Anel',
    price: 10,
    quantity: 1,
    available: 5,
    row_numbers: [2],
    ...overrides,
  };
}

describe('summarizeItems', () => {
  it('conta peças, unidades e valor', () => {
    expect(
      summarizeItems([
        item({ quantity: 2, price: 10 }),
        item({ product_id: 2, quantity: 3, price: 5 }),
      ]),
    ).toEqual({ pieces: 2, units: 5, value: 35 });
  });

  it('lista vazia zera tudo', () => {
    expect(summarizeItems([])).toEqual({ pieces: 0, units: 0, value: 0 });
  });
});

describe('setItemQuantity', () => {
  const items = [item({ product_id: 1, available: 4 }), item({ product_id: 2 })];
  const qtyOf = (list: TransferBatchItemPreview[], id: number) =>
    list.find((i) => i.product_id === id)?.quantity;

  it('altera só a peça pedida', () => {
    const result = setItemQuantity(items, 1, 3);
    expect(qtyOf(result, 1)).toBe(3);
    expect(qtyOf(result, 2)).toBe(1);
  });

  it('não passa do disponível nem fica abaixo de 1', () => {
    expect(qtyOf(setItemQuantity(items, 1, 99), 1)).toBe(4);
    expect(qtyOf(setItemQuantity(items, 1, 0), 1)).toBe(1);
    expect(qtyOf(setItemQuantity(items, 1, -2), 1)).toBe(1);
  });

  it('arredonda para baixo e trata campo vazio como 1', () => {
    expect(qtyOf(setItemQuantity(items, 1, 2.7), 1)).toBe(2);
    expect(qtyOf(setItemQuantity(items, 1, NaN), 1)).toBe(1);
  });
});

describe('removeItem', () => {
  it('tira a peça da lista', () => {
    expect(
      removeItem([item({ product_id: 1 }), item({ product_id: 2 })], 1).map((i) => i.product_id),
    ).toEqual([2]);
  });
});

describe('locationLabel', () => {
  const sellers = [{ id: 10, name: 'Ana' }];

  it('null é o Central', () => {
    expect(locationLabel(null, sellers)).toBe(CENTRAL_LABEL);
  });

  it('id mostra o nome da revendedora', () => {
    expect(locationLabel(10, sellers)).toBe('Ana');
    expect(locationLabel(99, sellers)).toBe('Revendedora #99');
  });
});

describe('batchLocationLabel', () => {
  it('usa o nome do lote ou o Central', () => {
    expect(batchLocationLabel(null, null)).toBe(CENTRAL_LABEL);
    expect(batchLocationLabel(10, 'Ana')).toBe('Ana');
    expect(batchLocationLabel(10, null)).toBe('Revendedora #10');
  });
});

describe('parseLocationParam', () => {
  it('central, id ou inválido', () => {
    expect(parseLocationParam('central')).toBeNull();
    expect(parseLocationParam('12')).toBe(12);
    expect(parseLocationParam('abc')).toBeUndefined();
    expect(parseLocationParam(null)).toBeUndefined();
  });
});

describe('formatRowNumbers', () => {
  it('singular e plural', () => {
    expect(formatRowNumbers([3])).toBe('Linha 3');
    expect(formatRowNumbers([3, 8])).toBe('Linhas 3, 8');
    expect(formatRowNumbers([])).toBe('');
  });
});
