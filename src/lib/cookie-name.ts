/**
 * Nome do cookie de sessão — isolado num módulo à parte (sem depender de
 * `next/headers`) para poder ser importado tanto em Server Components/Route
 * Handlers (via `cookies.ts`) quanto em Middleware e Client Components, que
 * não podem importar `next/headers`.
 */
export const COOKIE_NAME = 'lumilee_token';
