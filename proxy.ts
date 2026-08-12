import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/cookie-name';

/**
 * Proxy de Autenticação e Redirecionamento (Next.js 16)
 * ------------------------------------------------
 * Controla o acesso às rotas /admin e /minha-conta com base no papel (role) do usuário.
 */
export default async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  let userRole: string | null = null;

  // Decodifica o token JWT para extrair o role de forma segura
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
      const payload = JSON.parse(decodedJson);
      userRole = payload.role;
    } catch (error) {
      console.error('[Middleware] Erro ao decodificar token:', error);
    }
  }

  // Papéis de staff com acesso ao painel: 'superadmin' nunca existiu no banco
  // (ver StaffRole no backend — os papéis reais são admin/gestor/vendedor).
  // 'vendedor' não entra aqui: tem acesso ao PDV via API, mas não ao /admin completo.
  const isAdmin = userRole === 'admin' || userRole === 'gestor';

  // Aviso: esta checagem só decodifica o JWT (sem verificar assinatura) para
  // decidir o redirecionamento — é uma otimização de UX (evita renderizar a
  // casca do admin antes de redirecionar), não uma fronteira de segurança.
  // A autorização real é sempre imposta pelo RolesGuard no backend.

  // 1. Redirecionamento Inteligente da Tela de Login
  if (pathname.startsWith('/login')) {
    if (token) {
      // Se já está logado, manda pro lugar certo
      const destination = isAdmin ? '/admin' : '/minha-conta';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // 2. Proteção das Rotas Administrativas
  if (pathname.startsWith('/admin')) {
    if (!token || !isAdmin) {
      // Se não é admin, manda pro login
      return NextResponse.redirect(new URL('/login', request.url));
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
