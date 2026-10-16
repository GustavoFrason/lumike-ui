import { backendErrorMessage, resolveBackendPath } from '../bff-routes';

const resolve = (path: string) => resolveBackendPath(path.split('/'));

describe('resolveBackendPath', () => {
  // Um caminho de cada chamada que as telas fazem hoje (lib/services e páginas).
  it.each([
    ['produtos', '/products'],
    ['produtos/9', '/products/9'],
    ['produtos/9/permanent', '/products/9/permanent'],
    ['produtos/9/images/4', '/products/9/images/4'],
    ['produtos/bulk-status', '/products/bulk-status'],
    ['produtos/lookup', '/products/lookup'],
    ['produtos/slug/anel-solitario', '/products/slug/anel-solitario'],
    ['categorias/3/permanent', '/categories/3/permanent'],
    ['categorias/slug/aneis', '/categories/slug/aneis'],
    [
      'colecoes/9444af41-8899-4bd3-b38e-12f037d51426',
      '/collections/9444af41-8899-4bd3-b38e-12f037d51426',
    ],
    ['clientes/12', '/customers/12'],
    ['clientes/import/preview', '/customer-import/preview'],
    ['clientes/import/confirm', '/customer-import/confirm'],
    ['compras/5', '/purchases/5'],
    ['compras/import/preview', '/purchase-import/preview'],
    ['fornecedores/roi-analysis', '/suppliers/roi-analysis'],
    ['garantias/stats', '/warranties/stats'],
    ['pedidos', '/orders'],
    ['pedidos/summary', '/orders/summary'],
    ['pedidos/3/status', '/orders/3/status'],
    ['pedidos/3/cancel', '/orders/3/cancel'],
    ['inventory/products/9/entry', '/inventory/products/9/entry'],
    ['inventory/sellers', '/inventory/sellers'],
    ['inventory/users/4', '/inventory/users/4'],
    ['inventory/transfer-batches', '/transfer-batches'],
    ['inventory/transfer-batches/preview-all', '/transfer-batches/preview-all'],
    ['inventory/transfer-batches/7', '/transfer-batches/7'],
    ['users/roles', '/users/roles'],
    ['users/4/commission-rate', '/users/4/commission-rate'],
    ['settings/whatsapp_number', '/settings/whatsapp_number'],
    ['dashboard/low-stock', '/dashboard/low-stock'],
    ['cash-flow/balance', '/cash-flow/balance'],
    ['accounts-receivable/pay/8', '/accounts-receivable/pay/8'],
    ['accessory-purchases/2', '/accessory-purchases/2'],
    ['resellers/4/settlements', '/resellers/4/settlements'],
    ['favorites/toggle', '/favorites/toggle'],
    ['stock-notifications/my-alerts', '/stock-notifications/my-alerts'],
    ['leads', '/leads'],
    ['uploads/images', '/uploads/images'],
  ])('/api/%s → %s', (bff, backend) => {
    expect(resolve(bff)).toBe(backend);
  });

  it.each([['auth/login'], ['health'], ['clientesx'], ['products'], ['']])(
    'refuses a prefix outside the table: "%s"',
    (bff) => {
      expect(resolve(bff)).toBeNull();
    },
  );

  it('refuses dot segments, even percent-encoded', () => {
    expect(resolveBackendPath(['produtos', '..', 'auth', 'register'])).toBeNull();
    expect(resolveBackendPath(['produtos', '%2E%2E', 'auth'])).toBeNull();
    expect(resolveBackendPath(['produtos', '.'])).toBeNull();
    expect(resolveBackendPath([])).toBeNull();
  });

  it('keeps each segment as a single encoded segment', () => {
    expect(resolveBackendPath(['produtos', 'slug', 'a b'])).toBe('/products/slug/a%20b');
    expect(resolveBackendPath(['produtos', 'slug', 'a%20b'])).toBe('/products/slug/a%20b');
    expect(resolveBackendPath(['produtos', 'a%2Fb'])).toBe('/products/a%2Fb');
  });
});

describe('backendErrorMessage', () => {
  it('uses the backend message', () => {
    expect(backendErrorMessage({ statusCode: 400, message: 'Estoque insuficiente' }, 'x')).toBe(
      'Estoque insuficiente',
    );
  });

  it('joins validation messages into one sentence', () => {
    expect(
      backendErrorMessage({ message: ['name should not be empty', 'price must be a number'] }, 'x'),
    ).toBe('name should not be empty; price must be a number');
  });

  it('falls back when there is no usable message', () => {
    expect(backendErrorMessage(undefined, 'Erro')).toBe('Erro');
    expect(backendErrorMessage({ message: '' }, 'Erro')).toBe('Erro');
    expect(backendErrorMessage({ message: [] }, 'Erro')).toBe('Erro');
  });
});
