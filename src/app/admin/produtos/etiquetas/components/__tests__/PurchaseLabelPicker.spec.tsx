import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PurchaseLabelPicker, purchaseOptionLabel } from '../PurchaseLabelPicker';
import { purchasesService, type Purchase } from '@/lib/services/purchases.service';

jest.mock('@/lib/services/purchases.service', () => ({
  purchasesService: { findAll: jest.fn() },
}));

const mockedFindAll = purchasesService.findAll as jest.Mock;

const purchase = (id: number, date: string, supplier: string, items: number): Purchase => ({
  id,
  supplier_id: 2,
  total_amount: 100,
  notes: null,
  purchase_date: date,
  created_at: '2026-10-08T00:56:55Z',
  updated_at: '2026-10-08T00:56:55Z',
  items_count: items,
  suppliers: { name: supplier },
});

const props = {
  applied: null,
  loadingId: null,
  error: null,
  onSelect: jest.fn(),
  onClear: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedFindAll.mockResolvedValue({
    data: [
      purchase(5, '2026-10-12', 'Zarpellon Joias', 7),
      purchase(4, '2026-08-31', 'Alinare', 1),
    ],
    pagination: { page: 1, limit: 50, total: 2 },
  });
});

describe('PurchaseLabelPicker', () => {
  it('lists the purchases by their real date', async () => {
    render(<PurchaseLabelPicker {...props} />);

    expect(
      await screen.findByRole('option', { name: '31/08/2026 · Alinare · 1 produto (#4)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: '12/10/2026 · Zarpellon Joias · 7 produtos (#5)' }),
    ).toBeInTheDocument();
    expect(mockedFindAll).toHaveBeenCalledWith(1, 50);
  });

  it('asks for the chosen purchase', async () => {
    render(<PurchaseLabelPicker {...props} />);
    await screen.findByRole('option', { name: /#4/ });

    fireEvent.change(screen.getByLabelText('Etiquetas de uma compra'), {
      target: { value: '4' },
    });

    expect(props.onSelect).toHaveBeenCalledWith(4);
  });

  it('shows what was selected, including inactive products', async () => {
    render(
      <PurchaseLabelPicker
        {...props}
        applied={{
          id: 3,
          purchaseDate: '2026-09-22',
          supplierName: 'Zarpellon Joias',
          pieces: 401,
          inactive: 9,
        }}
      />,
    );
    await screen.findByRole('option', { name: /#4/ });

    expect(screen.getByText(/401 etiquetas/)).toBeInTheDocument();
    expect(screen.getByText(/Inclui 9 produtos inativos/)).toBeInTheDocument();
    // Compra antiga, fora das mais recentes: entra como opção para ficar selecionada.
    expect(screen.getByLabelText('Etiquetas de uma compra')).toHaveValue('3');

    fireEvent.click(screen.getByRole('button', { name: 'Limpar seleção da compra' }));
    expect(props.onClear).toHaveBeenCalled();
  });
});

describe('purchaseOptionLabel', () => {
  it('handles a purchase without supplier', () => {
    expect(purchaseOptionLabel({ ...purchase(9, '2026-01-05', 'x', 2), suppliers: null })).toBe(
      '05/01/2026 · Sem fornecedor · 2 produtos (#9)',
    );
  });
});
