import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExcelImporter } from '../ExcelImporter';
import { purchaseImportService } from '@/lib/services/purchase-import.service';
import type { ImportPreviewResponse } from '../types';

jest.mock('@/lib/services/purchase-import.service', () => ({
  purchaseImportService: { preview: jest.fn(), confirm: jest.fn() },
}));

const mockedPreview = purchaseImportService.preview as jest.Mock;
const mockedConfirm = purchaseImportService.confirm as jest.Mock;

const suppliers = [
  { id: 2, name: 'Zarpellon Joias' },
  { id: 3, name: 'Alinare' },
];

/** Prévia com uma peça que já existe, cadastrada para o fornecedor `supplierId`. */
function previewWithExisting(supplierId: number | null): ImportPreviewResponse {
  return {
    novos: [],
    atualizacoes: [
      {
        row_number: 2,
        sku2: '857109',
        name: 'ANEL SOLITARIO',
        quantity: 2,
        unit_cost: 50,
        pieces_per_kit: 1,
        pieces_per_kit_suggested: false,
        existing_product: {
          id: 710,
          name: 'ANEL SOLITARIO MEIA CRAVACAO',
          current_stock: 3,
          price: 150,
          supplier_id: supplierId,
          matched_by: 'sku2',
          match_count: 1,
        },
      },
    ],
    naoCatalogaveis: [],
    erros: [],
  };
}

async function renderWithPreview(preview: ImportPreviewResponse) {
  mockedPreview.mockResolvedValue(preview);
  const onConfirm = jest.fn();
  const { container } = render(
    <ExcelImporter
      categories={[]}
      suppliers={suppliers}
      onConfirm={onConfirm}
      onCancel={jest.fn()}
    />,
  );
  const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
  await act(async () => {
    fireEvent.change(fileInput, {
      target: { files: [new File(['x'], 'compra.xlsx')] },
    });
  });
  return { onConfirm };
}

const chooseSupplier = (id: number | '') =>
  fireEvent.change(screen.getByLabelText('Fornecedor'), { target: { value: String(id) } });

const confirmButton = () => screen.getByRole('button', { name: /confirmar importação/i });

beforeEach(() => {
  mockedPreview.mockReset();
  mockedConfirm.mockReset().mockResolvedValue({ purchase_id: 1, created: 0, updated: 1 });
});

describe('ExcelImporter: fornecedor da compra', () => {
  it('starts without a supplier and blocks the confirmation', async () => {
    await renderWithPreview(previewWithExisting(3));

    expect(screen.getByLabelText('Fornecedor')).toHaveValue('');
    expect(screen.getByText('Escolha o fornecedor da compra')).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it('sends the chosen supplier on confirm', async () => {
    const { onConfirm } = await renderWithPreview(previewWithExisting(3));

    chooseSupplier(3);
    expect(confirmButton()).toBeEnabled();
    await act(async () => fireEvent.click(confirmButton()));

    expect(mockedConfirm).toHaveBeenCalledWith(
      [expect.objectContaining({ is_new: false, product_id: 710, quantity: 2 })],
      { supplierId: 3, purchaseDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) },
    );
    expect(onConfirm).toHaveBeenCalled();
  });

  it('warns when the matched piece belongs to another supplier', async () => {
    await renderWithPreview(previewWithExisting(2));
    const warning = /cadastrado como zarpellon joias/i;

    // Sem fornecedor escolhido não há com o que comparar.
    expect(screen.queryByText(warning)).not.toBeInTheDocument();

    chooseSupplier(3);
    expect(screen.getByText(warning)).toBeInTheDocument();

    chooseSupplier(2);
    expect(screen.queryByText(warning)).not.toBeInTheDocument();
  });

  it('does not warn for a piece without a supplier', async () => {
    await renderWithPreview(previewWithExisting(null));

    chooseSupplier(3);

    expect(screen.queryByText(/cadastrado como/i)).not.toBeInTheDocument();
  });
});
