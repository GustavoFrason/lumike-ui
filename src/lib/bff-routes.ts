/**
 * bff-routes.ts
 * ------------------------------------
 * Tabela do BFF: qual recurso do backend atende cada `/api/...` do Next.
 *
 * O proxy único (`app/api/[...path]/route.ts`) só repassa caminhos que
 * começam por um destes prefixos; o resto do caminho vai igual. Antes eram
 * 75 arquivos de rota, um por endpoint, e qualquer endpoint esquecido
 * respondia 404 (ex: exclusão permanente de categoria e de coleção).
 *
 * Autorização continua sendo do backend (RolesGuard): o BFF só anexa o
 * token do cookie httpOnly. A tabela existe para o proxy não virar um
 * repasse aberto para qualquer caminho da API.
 */

/** Nomes em português usados pelas telas → recurso do backend. */
const RENAMED: Record<string, string> = {
  produtos: '/products',
  categorias: '/categories',
  colecoes: '/collections',
  'clientes/import': '/customer-import',
  clientes: '/customers',
  'compras/import': '/purchase-import',
  compras: '/purchases',
  fornecedores: '/suppliers',
  garantias: '/warranties',
  pedidos: '/orders',
  'inventory/transfer-batches': '/transfer-batches',
};

/** Prefixos com o mesmo nome no BFF e no backend. */
const SAME_NAME = [
  'inventory',
  'users',
  'settings',
  'dashboard',
  'cash-flow',
  'accounts-receivable',
  'accessory-purchases',
  'resellers',
  'favorites',
  'stock-notifications',
  'leads',
  'uploads',
];

interface BffPrefix {
  segments: string[];
  backend: string;
}

// Prefixo mais longo primeiro: `clientes/import` antes de `clientes`.
const PREFIXES: BffPrefix[] = [
  ...Object.entries(RENAMED),
  ...SAME_NAME.map((name) => [name, `/${name}`] as const),
]
  .map(([bff, backend]) => ({ segments: bff.split('/'), backend }))
  .sort((a, b) => b.segments.length - a.segments.length);

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Caminho no backend para os segmentos de `/api/...`, ou `null` se o
 * prefixo não estiver na tabela.
 *
 * Cada segmento volta codificado, e `.`/`..` são recusados: sem isso,
 * `/api/produtos/%2E%2E/auth/register` sairia do prefixo permitido.
 */
export function resolveBackendPath(segments: readonly string[]): string | null {
  const decoded = segments.map(decodeSegment);
  if (decoded.length === 0 || decoded.some((s) => s === '' || s === '.' || s === '..')) {
    return null;
  }

  const prefix = PREFIXES.find((p) => p.segments.every((part, i) => decoded[i] === part));
  if (!prefix) return null;

  const rest = decoded.slice(prefix.segments.length).map(encodeURIComponent);
  return [prefix.backend, ...rest].join('/');
}

/**
 * Mensagem de erro do corpo que o backend devolve
 * (`{ statusCode, message }`). Erro de validação vem com `message` em lista,
 * que vira uma frase só para caber num toast.
 */
export function backendErrorMessage(data: unknown, fallback: string): string {
  const message = (data as { message?: unknown } | null)?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) {
    const parts = message.filter((m): m is string => typeof m === 'string' && m.trim() !== '');
    if (parts.length) return parts.join('; ');
  }
  return fallback;
}
