import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/cookies';

/**
 * Rota: /api/logout
 * ------------------------------------------------
 * Remove o cookie de autenticação e redireciona para /login.
 * Essa rota é chamada quando o usuário clica em "Sair".
 */
export async function POST() {
  try {
    // Remove o cookie do usuário autenticado
    await clearAuthCookie();

    // Redireciona de volta para a tela de login
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const response = NextResponse.redirect(new URL('/login', siteUrl || 'http://localhost:3000'));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Erro ao efetuar logout:', error);
    return NextResponse.json({ message: 'Erro ao efetuar logout.' }, { status: 500 });
  }
}