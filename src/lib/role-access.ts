/**
 * role-access.ts
 * ------------------------------------
 * Regras de navegação por papel (UX). Usado pelo proxy.ts (redireciona
 * antes de renderizar) e pelo LoginForm (destino pós-login).
 *
 * NÃO é fronteira de segurança: quem autoriza dados é o RolesGuard do
 * backend. Papéis reais (StaffRole na API): admin, gestor, vendedor;
 * autocadastro vira `customer`.
 */

/** Painel completo. */
export function isManagementRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'gestor';
}

/**
 * Telas do painel liberadas para vendedor: PDV e impressões da venda
 * (o backend já permite criar venda/buscar cliente/consultar estoque para
 * qualquer staff).
 */
const VENDEDOR_ADMIN_PREFIXES = [
  '/admin/vendas/nova',
  '/admin/vendas/recibo',
  '/admin/vendas/garantia',
];

export const VENDEDOR_HOME = '/admin/vendas/nova';

export function canAccessAdminPath(role: string | null | undefined, pathname: string): boolean {
  if (isManagementRole(role)) return true;
  if (role === 'vendedor') {
    return VENDEDOR_ADMIN_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  }
  return false;
}

/** Para onde mandar o usuário logado que não pediu um destino específico. */
export function getHomePathForRole(role: string | null | undefined): string {
  if (isManagementRole(role)) return '/admin';
  if (role === 'vendedor') return VENDEDOR_HOME;
  return '/minha-conta';
}
