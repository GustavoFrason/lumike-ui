import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/cookie-name';

export { COOKIE_NAME };

/**
 * Define o cookie de autenticação.
 */
export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas (mesmo tempo do JWT)
  });
}

/**
 * Remove o cookie de autenticação.
 */
export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * Lê o cookie de autenticação.
 */
export async function getAuthCookie(): Promise<string | undefined> {
  try {
    const store = await cookies();
    // Ausência do cookie é o caso normal de visitante anônimo (ex: toda
    // chamada a /api/session) — não loga.
    return store.get(COOKIE_NAME)?.value;
  } catch (error) {
    console.error('[Cookies] Erro ao ler cookie:', error);
    return undefined;
  }
}
