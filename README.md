# lumike-ui

Vitrine e painel administrativo da Lumilee Semijoias: Next.js 16 (App Router), React 19 e Tailwind CSS 4.

O navegador não chama a `lumike-api` direto. O proxy único em `src/app/api/[...path]` (BFF) repassa cada chamada para a API com o token que fica no cookie de sessão `httpOnly`; a tabela de prefixos (`produtos` → `/products` etc.) está em `src/lib/bff-routes.ts`. As páginas renderizadas no servidor chamam a API por `src/lib/api-server.ts`.

## Rodando

```bash
npm install
npm run dev   # http://localhost:3000
```

Variáveis em `.env.local`:

| Variável                | Para quê                                                            |
| ----------------------- | ------------------------------------------------------------------- |
| `API_URL`               | URL da `lumike-api`, só no servidor; padrão `http://localhost:3001` |
| `INTERNAL_PROXY_SECRET` | mesmo valor da API; repassa o IP real do cliente para o rate limit  |

`NEXT_PUBLIC_API_URL`, o nome antigo, continua aceito quando `API_URL` não existe.

Comandos: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. O pre-commit (husky) roda lint, prettier e typecheck.

O guia completo, com API e UI, está no `SETUP.md` do monorepo `lumike`.
