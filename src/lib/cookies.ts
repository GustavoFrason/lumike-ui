import { cookies } from 'next/headers';

const COOKIE_NAME = 'lumike_token';

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
    const cookie = store.get(COOKIE_NAME);
    if (!cookie) {
      console.warn(`[Cookies] Cookie ${COOKIE_NAME} não encontrado`);
      return undefined;
    }
    return cookie.value;
  } catch (error) {
    console.error('[Cookies] Erro ao ler cookie:', error);
    return undefined;
  }
}