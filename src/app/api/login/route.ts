/**
 * /api/login
 * ------------------------------------
 * Faz proxy seguro para o backend NestJS.
 * Ao autenticar, salva o token JWT no cookie httpOnly.
 */

import { NextResponse } from 'next/server';
import { setAuthCookie, clearAuthCookie } from '@/lib/cookies';

export async function POST(req: Request) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 },
      );
    }

    // Faz proxy para o backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro ao autenticar' }));
      await clearAuthCookie();
      return NextResponse.json(
        { success: false, message: errorData.message || 'Falha na autenticação' },
        { status: response.status },
      );
    }

    const data = await response.json();

    if (data.access_token) {
      await setAuthCookie(data.access_token);
      return NextResponse.json({ success: true, user: data.user, token: data.access_token });
    } else {
      await clearAuthCookie();
      return NextResponse.json({ success: false, message: 'Token não recebido' }, { status: 500 });
    }
  } catch (error: unknown) {
    await clearAuthCookie();
    console.error('Erro ao autenticar:', error);
    const message = error instanceof Error ? error.message : 'Falha na autenticação';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
