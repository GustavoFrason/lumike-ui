/**
 * catalog-query.ts
 * ------------------------------------
 * Filtros da vitrine (home) a partir da URL (`?q=&category=&collection=&page=`)
 * e a querystring correspondente do GET /products da API.
 *
 * Antes a home buscava as 100 peças mais novas e filtrava em memória: peça
 * mais antiga nunca aparecia, nem na busca. Agora filtro e paginação rodam
 * no banco.
 */

/** Peças por página na vitrine. */
export const CATALOG_PAGE_SIZE = 24;

/** Destaques no carrossel do topo. */
export const CATALOG_FEATURED_LIMIT = 12;

/** Âncora da grade "Todas as Peças": a paginação volta para ela. */
export const CATALOG_GRID_ID = 'todas-as-pecas';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export interface CatalogFilters {
  search?: string;
  categoryId?: string;
  collectionId?: string;
  page: number;
}

const firstValue = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

/**
 * Lê os filtros da URL. Valor inválido (categoria não numérica, coleção que
 * não é UUID, página < 1) é ignorado em vez de virar 400 na API.
 */
export function parseCatalogFilters(params: CatalogSearchParams): CatalogFilters {
  const category = firstValue(params.category);
  const collection = firstValue(params.collection);
  const page = Number(firstValue(params.page));

  return {
    search: firstValue(params.q),
    categoryId: category && /^\d+$/.test(category) ? category : undefined,
    collectionId: collection && UUID_RE.test(collection) ? collection : undefined,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

export function hasActiveCatalogFilters(filters: CatalogFilters): boolean {
  return Boolean(filters.search || filters.categoryId || filters.collectionId);
}

/** Querystring do GET /products da API para a página pedida. */
export function buildCatalogProductsQuery(filters: CatalogFilters): string {
  const query = new URLSearchParams({
    page: String(filters.page),
    limit: String(CATALOG_PAGE_SIZE),
    is_active: 'true',
  });
  if (filters.search) query.set('search', filters.search);
  if (filters.categoryId) query.set('category_id', filters.categoryId);
  if (filters.collectionId) query.set('colecao_id', filters.collectionId);
  return query.toString();
}

/** Link da página `page` da vitrine, mantendo os filtros. */
export function catalogPageHref(filters: CatalogFilters, page: number): string {
  const query = new URLSearchParams();
  if (filters.search) query.set('q', filters.search);
  if (filters.categoryId) query.set('category', filters.categoryId);
  if (filters.collectionId) query.set('collection', filters.collectionId);
  if (page > 1) query.set('page', String(page));

  const qs = query.toString();
  return `/${qs ? `?${qs}` : ''}#${CATALOG_GRID_ID}`;
}
