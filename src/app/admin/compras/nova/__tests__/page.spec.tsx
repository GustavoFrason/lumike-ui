import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import NovaCompraPage from '../page';
import { purchasesService } from '@/lib/services/purchases.service';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const product = { id: 10, name: 'Anel Solitário', sku: '10', cost_price: 50, images: [] };
jest.mock('@/lib/hooks/use-products', () => ({
  useProducts: () => ({
    products: [product],
    loadProducts: jest.fn(),
    createProduct: jest.fn(),
    creating: false,
    errorCreating: null,
  }),
}));
jest.mock('@/lib/hooks/use-suppliers', () => ({
  useSuppliers: () => ({ suppliers: [{ id: 3, name: 'Alinare' }], loadSuppliers: jest.fn() }),
}));
jest.mock('@/lib/hooks/use-categories', () => ({
  useCategories: () => ({ categories: [], loadCategories: jest.fn() }),
}));
jest.mock('@/lib/services/purchases.service', () => ({
  purchasesService: { create: jest.fn() },
}));
jest.mock('@/app/admin/produtos/ProductModal', () => ({ ProductModal: () => null }));
// O importador tem testes próprios; aqui só importa o que acontece depois.
jest.mock('../components/excel-importer/ExcelImporter', () => ({
  ExcelImporter: ({ onConfirm }: { onConfirm: (r: unknown) => void }) => (
    <button onClick={() => onConfirm({ purchase_id: 12, created: 1, updated: 2 })}>
      simular importação
    </button>
  ),
}));

const mockedCreate = purchasesService.create as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedCreate.mockResolvedValue({ id: 21 });
});

async function registerManualPurchase() {
  render(<NovaCompraPage />);
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } });
  fireEvent.change(screen.getByPlaceholderText('Buscar produto por nome ou SKU...'), {
    target: { value: 'anel' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Anel Solitário/ }));
  fireEvent.change(screen.getByLabelText('Data da Compra'), { target: { value: '2026-08-31' } });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /Salvar Compra/ })));
}

describe('Nova compra: etiquetas depois de registrar', () => {
  it('manual: sends the purchase date and opens the labels of the new purchase', async () => {
    await registerManualPurchase();

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({ supplier_id: 3, purchase_date: '2026-08-31' }),
    );
    expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Compra registrada');

    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Imprimir etiquetas' })),
    );
    expect(push).toHaveBeenCalledWith('/admin/produtos/etiquetas?compra=21');
  });

  it('manual: "Agora não" goes back to the purchases list as before', async () => {
    await registerManualPurchase();

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Agora não' })));
    expect(push).toHaveBeenCalledWith('/admin/compras');
  });

  it('spreadsheet: offers the labels of the imported purchase', async () => {
    render(<NovaCompraPage />);
    fireEvent.click(screen.getByRole('button', { name: /Importar Planilha/ }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'simular importação' })),
    );

    expect(screen.getByText(/Planilha importada!/)).toBeInTheDocument();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Imprimir etiquetas' })),
    );
    expect(push).toHaveBeenCalledWith('/admin/produtos/etiquetas?compra=12');
  });

  it('spreadsheet: "Agora não" stays on the page with the success message', async () => {
    render(<NovaCompraPage />);
    fireEvent.click(screen.getByRole('button', { name: /Importar Planilha/ }));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'simular importação' })),
    );

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Agora não' })));
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByText(/Planilha importada!/)).toBeInTheDocument();
  });
});
