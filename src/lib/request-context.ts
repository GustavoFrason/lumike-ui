/**
 * request-context.ts
 * ------------------------------------
 * Só servidor (route handlers / Server Components).
 *
 * Toda chamada ao backend sai deste servidor Next, então sem isto o
 * NestJS enxerga um único IP para todos os visitantes: o rate limit de
 * login (5/min) bloqueava todo mundo ao mesmo tempo e o site inteiro
 * dividia um limite só. Aqui repassamos o IP real do visitante junto com
 * um segredo compartilhado (INTERNAL_PROXY_SECRET, sem NEXT_PUBLIC_) — o
 * backend só confia no X-Client-IP quando o segredo bate (ver
 * ClientIpThrottlerGuard na API).
 */

import { headers } from 'next/headers';

export async function getClientForwardHeaders(): Promise<Record<string, string>> {
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (!secret) return {};

  try {
    const incoming = await headers();
    const ip =
      incoming.get('x-real-ip')?.trim() || incoming.get('x-forwarded-for')?.split(',')[0]?.trim();

    if (!ip) return {};

    return {
      'X-Client-IP': ip,
      'X-Internal-Proxy-Secret': secret,
    };
  } catch {
    // Fora de um request (build/static) não há headers — segue sem.
    return {};
  }
}
