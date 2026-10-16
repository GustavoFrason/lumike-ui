/**
 * URL da lumike-api. Só para código de servidor (BFF, Server Components,
 * login/cadastro): o navegador nunca fala com a API direto.
 *
 * `API_URL` é a variável certa, porque sem o prefixo `NEXT_PUBLIC_` ela não
 * vai para o bundle do navegador. `NEXT_PUBLIC_API_URL` continua aceita
 * para os ambientes já configurados com ela não quebrarem.
 */
export function getBackendUrl(): string {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}
