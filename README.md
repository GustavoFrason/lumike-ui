# lumike-ui

Vitrine e painel administrativo da Lumilee Semijoias: Next.js 16 (App Router), React 19 e Tailwind CSS 4.

O navegador não chama a `lumike-api` direto. As rotas em `src/app/api` (BFF) repassam cada chamada para a API com o token que fica no cookie de sessão `httpOnly`. As páginas renderizadas no servidor chamam a API por `src/lib/api-server.ts`.

## Rodando

```bash
npm install
npm run dev   # http://localhost:3000
```

Variáveis em `.env.local`:

| Variável                | Para quê                                                           |
| ----------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`   | URL da `lumike-api`; padrão `http://localhost:3001`                |
| `INTERNAL_PROXY_SECRET` | mesmo valor da API; repassa o IP real do cliente para o rate limit |

Comandos: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. O pre-commit (husky) roda lint, prettier e typecheck.

O guia completo, com API e UI, está no `SETUP.md` do monorepo `lumike`.
