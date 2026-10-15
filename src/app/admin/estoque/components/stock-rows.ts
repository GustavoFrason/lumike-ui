import type { Product } from '@/lib/services/products.service';
import type { SellerInventory } from '@/lib/services/inventory.service';
import { rankProductsForSearch } from '@/lib/utils/sort-products';

/**
 * Linha da tela de Estoque: o produto + o estoque dividido por local.
 * Estende Product para os modais (entrada/saída/transferência/conferência)
 * continuarem recebendo a linha direto.
 *
 * `current_stock` é o estoque do Central (Lumilee); o que está com as
 * revendedoras vem de inventory_locations (getAllSellersStock).
 */
export type StockRow = Product & {
  stock_central: number;
  stock_sellers: number;
  stock_total: number;
  /** Revendedoras que têm ao menos 1 unidade desta peça. */
  seller_ids: number[];
};

export type StockStatus = 'out' | 'low' | 'normal';

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  out: 'Esgotado',
  low: 'Estoque Baixo',
  normal: 'Normal',
};

/** `'central'` = Estoque Lumilee; número = id da revendedora. */
export type StockLocationFilter = 'all' | 'central' | number;

export interface StockFilters {
  search: string;
  status: 'all' | StockStatus;
  categoryId?: number;
  location: StockLocationFilter;
  /** Faixa aplicada ao estoque TOTAL (Central + revendedoras). */
  minQty?: number;
  maxQty?: number;
}

export const EMPTY_STOCK_FILTERS: StockFilters = {
  search: '',
  status: 'all',
  categoryId: undefined,
  location: 'all',
  minQty: undefined,
  maxQty: undefined,
};

export function hasActiveStockFilters(filters: StockFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.status !== 'all' ||
    filters.categoryId !== undefined ||
    filters.location !== 'all' ||
    filters.minQty !== undefined ||
    filters.maxQty !== undefined
  );
}

/** Junta o estoque das revendedoras em cada produto. */
export function buildStockRows(products: Product[], sellers: SellerInventory[]): StockRow[] {
  const byProduct = new Map<number, { quantity: number; sellerIds: number[] }>();

  for (const seller of sellers) {
    for (const item of seller.items) {
      if (item.quantity <= 0) continue;
      const entry = byProduct.get(item.product_id) ?? { quantity: 0, sellerIds: [] };
      entry.quantity += item.quantity;
      entry.sellerIds.push(seller.user_id);
      byProduct.set(item.product_id, entry);
    }
  }

  return products.map((product) => {
    const central = product.current_stock ?? 0;
    const fromSellers = byProduct.get(product.id);
    const sellersQty = fromSellers?.quantity ?? 0;

    return {
      ...product,
      stock_central: central,
      stock_sellers: sellersQty,
      stock_total: central + sellersQty,
      seller_ids: fromSellers?.sellerIds ?? [],
    };
  });
}

/** Mesma regra de antes, agora sobre o total (Central + revendedoras). */
export function getStockStatus(row: StockRow): StockStatus {
  if (row.stock_total <= 0) return 'out';
  if (row.stock_total <= row.min_stock) return 'low';
  return 'normal';
}

function matchesLocation(row: StockRow, location: StockLocationFilter): boolean {
  if (location === 'all') return true;
  if (location === 'central') return row.stock_central > 0;
  return row.seller_ids.includes(location);
}

/**
 * Aplica todos os filtros da tela. A busca (nº do item, código Zarpellon,
 * nome) vem por último e também define a ordem — ver rankProductsForSearch.
 */
export function filterStockRows(rows: StockRow[], filters: StockFilters): StockRow[] {
  const filtered = rows.filter(
    (row) =>
      (filters.categoryId === undefined || row.category_id === filters.categoryId) &&
      (filters.status === 'all' || getStockStatus(row) === filters.status) &&
      matchesLocation(row, filters.location) &&
      (filters.minQty === undefined || row.stock_total >= filters.minQty) &&
      (filters.maxQty === undefined || row.stock_total <= filters.maxQty),
  );

  return rankProductsForSearch(filtered, filters.search);
}
