import {
  buildCatalogProductsQuery,
  catalogPageHref,
  CATALOG_PAGE_SIZE,
  hasActiveCatalogFilters,
  parseCatalogFilters,
} from '../catalog-query';

const COLLECTION_ID = '5f1c2b9e-8a7d-4c3b-9e2f-1a2b3c4d5e6f';

describe('parseCatalogFilters', () => {
  it('reads search, category, collection and page from the URL', () => {
    expect(
      parseCatalogFilters({ q: ' anel ', category: '3', collection: COLLECTION_ID, page: '2' }),
    ).toEqual({ search: 'anel', categoryId: '3', collectionId: COLLECTION_ID, page: 2 });
  });

  it('defaults to page 1 without filters', () => {
    expect(parseCatalogFilters({})).toEqual({
      search: undefined,
      categoryId: undefined,
      collectionId: undefined,
      page: 1,
    });
  });

  it('ignores invalid values instead of sending them to the API', () => {
    expect(
      parseCatalogFilters({ q: '   ', category: 'abc', collection: '12', page: '-1' }),
    ).toEqual({ search: undefined, categoryId: undefined, collectionId: undefined, page: 1 });
    expect(parseCatalogFilters({ page: '1.5' }).page).toBe(1);
  });

  it('uses the first value of repeated params', () => {
    expect(parseCatalogFilters({ category: ['4', '5'] }).categoryId).toBe('4');
  });
});

describe('hasActiveCatalogFilters', () => {
  it('ignores the page and looks only at the filters', () => {
    expect(hasActiveCatalogFilters({ page: 3 })).toBe(false);
    expect(hasActiveCatalogFilters({ page: 1, search: 'anel' })).toBe(true);
  });
});

describe('buildCatalogProductsQuery', () => {
  it('maps the filters to the API params', () => {
    const query = new URLSearchParams(
      buildCatalogProductsQuery({
        search: 'anel',
        categoryId: '3',
        collectionId: COLLECTION_ID,
        page: 2,
      }),
    );

    expect(Object.fromEntries(query)).toEqual({
      page: '2',
      limit: String(CATALOG_PAGE_SIZE),
      is_active: 'true',
      search: 'anel',
      category_id: '3',
      colecao_id: COLLECTION_ID,
    });
  });

  it('leaves out filters that are not set', () => {
    const query = new URLSearchParams(buildCatalogProductsQuery({ page: 1 }));
    expect(query.has('search')).toBe(false);
    expect(query.has('category_id')).toBe(false);
    expect(query.has('colecao_id')).toBe(false);
  });
});

describe('catalogPageHref', () => {
  it('keeps the filters and points to the grid', () => {
    expect(catalogPageHref({ search: 'anel', categoryId: '3', page: 1 }, 2)).toBe(
      '/?q=anel&category=3&page=2#todas-as-pecas',
    );
  });

  it('drops page=1 from the URL', () => {
    expect(catalogPageHref({ page: 2 }, 1)).toBe('/#todas-as-pecas');
  });
});
