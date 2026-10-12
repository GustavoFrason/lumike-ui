import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/cookies';

/**
 * Rota: /api/logout
 * ------------------------------------------------
 * Remove o cookie de autenticação e redireciona para /login.
 * Essa rota é chamada quando o usuário clica em "Sair".
 */
export async function POST(request: NextRequest) {
  try {
    // Remove o cookie do usuário autenticado
    await clearAuthCookie();

    // Redireciona para /login na MESMA origem da requisição. Antes usava
    // NEXT_PUBLIC_SITE_URL com fallback para http://localhost:3000 (a env
    // não existe em produção → logout caía no localhost). 303 faz o
    // navegador seguir com GET; o 307 padrão reenviava o POST para /login.
    const response = NextResponse.redirect(new URL('/login', request.nextUrl.origin), 303);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Erro ao efetuar logout:', error);
    return NextResponse.json({ message: 'Erro ao efetuar logout.' }, { status: 500 });
  }
}
