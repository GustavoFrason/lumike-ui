import { canAccessAdminPath, getHomePathForRole, isManagementRole } from '../role-access';

describe('role-access', () => {
  it('admin and gestor are management roles', () => {
    expect(isManagementRole('admin')).toBe(true);
    expect(isManagementRole('gestor')).toBe(true);
    expect(isManagementRole('vendedor')).toBe(false);
    expect(isManagementRole('customer')).toBe(false);
    expect(isManagementRole(null)).toBe(false);
  });

  it('management roles can open any admin screen', () => {
    expect(canAccessAdminPath('admin', '/admin/fluxo-caixa')).toBe(true);
    expect(canAccessAdminPath('gestor', '/admin')).toBe(true);
  });

  it('vendedor can open only the POS and sale printouts', () => {
    expect(canAccessAdminPath('vendedor', '/admin/vendas/nova')).toBe(true);
    expect(canAccessAdminPath('vendedor', '/admin/vendas/recibo/12')).toBe(true);
    expect(canAccessAdminPath('vendedor', '/admin/vendas/garantia/12')).toBe(true);

    expect(canAccessAdminPath('vendedor', '/admin')).toBe(false);
    expect(canAccessAdminPath('vendedor', '/admin/vendas')).toBe(false);
    expect(canAccessAdminPath('vendedor', '/admin/fluxo-caixa')).toBe(false);
    expect(canAccessAdminPath('vendedor', '/admin/vendas/novaXYZ')).toBe(false);
  });

  it('customers and anonymous users cannot open admin screens', () => {
    expect(canAccessAdminPath('customer', '/admin/vendas/nova')).toBe(false);
    expect(canAccessAdminPath(null, '/admin')).toBe(false);
  });

  it('home path depends on the role', () => {
    expect(getHomePathForRole('admin')).toBe('/admin');
    expect(getHomePathForRole('gestor')).toBe('/admin');
    expect(getHomePathForRole('vendedor')).toBe('/admin/vendas/nova');
    expect(getHomePathForRole('customer')).toBe('/minha-conta');
    expect(getHomePathForRole(undefined)).toBe('/minha-conta');
  });
});
