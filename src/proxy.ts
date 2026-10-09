import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/cookie-name';
import { decodeJwtPayload, isJwtExpired } from '@/lib/jwt';
import { canAccessAdminPath, getHomePathForRole } from '@/lib/role-access';

/**
 * Proxy de Autenticação e Redirecionamento (Next.js 16)
 * ------------------------------------------------
 * Controla o acesso às rotas /admin e /minha-conta com base no papel (role) do usuário.
 *
 * Precisa ficar em `src/proxy.ts`: com o app em `src/app`, o Next só
 * carrega o proxy de dentro de `src/`. Na raiz do projeto ele era
 * ignorado — o middleware compilado saía vazio e nenhuma destas regras
 * rodava.
 */
export default async function proxy(request: NextRequest) {
  const rawToken = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  // Decodifica o JWT (sem verificar assinatura — ver aviso abaixo). Cookie
  // ilegível ou expirado conta como "sem sessão": antes, um token vencido
  // ainda mandava /login → /admin e a primeira chamada à API derrubava a
  // sessão com 401.
  const payload = decodeJwtPayload(rawToken);
  const token = payload && !isJwtExpired(payload) ? rawToken : undefined;
  const userRole: string | null = token ? (payload?.role ?? null) : null;

  // Aviso: esta checagem só decodifica o JWT (sem verificar assinatura) para
  // decidir o redirecionamento — é uma otimização de UX (evita renderizar a
  // casca do admin antes de redirecionar), não uma fronteira de segurança.
  // A autorização real é sempre imposta pelo RolesGuard no backend.
  // Regras por papel (admin/gestor: painel todo; vendedor: só PDV) em
  // lib/role-access.ts.

  // 1. Redirecionamento Inteligente da Tela de Login
  if (pathname.startsWith('/login')) {
    if (token) {
      // Se já está logado, manda pro lugar certo
      return NextResponse.redirect(new URL(getHomePathForRole(userRole), request.url));
    }
    return NextResponse.next();
  }

  // 2. Proteção das Rotas Administrativas
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (!canAccessAdminPath(userRole, pathname)) {
      // Logado mas sem acesso a esta tela: vai para a "casa" do papel
      // (vendedor → PDV; cliente → /minha-conta).
      return NextResponse.redirect(new URL(getHomePathForRole(userRole), request.url));
    }
    return NextResponse.next();
  }

  // 3. Proteção da Área do Cliente
  if (pathname.startsWith('/minha-conta')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

/**
 * Define em quais rotas o middleware deve rodar
 */
export const config = {
  matcher: ['/admin/:path*', '/minha-conta/:path*', '/login'],
};
