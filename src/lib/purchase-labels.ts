import type { Product } from '@/lib/services/products.service';
import type { PurchaseItemProduct, PurchaseWithItems } from '@/lib/services/purchases.service';

export interface PurchaseLabelSelection {
  /** product_id → nº de etiquetas (= peças compradas). */
  quantities: Record<number, number>;
  /** Produtos da compra, no formato que a tela de etiquetas usa. */
  products: Product[];
  /** Total de etiquetas. */
  pieces: number;
  /** Quantos produtos da compra estão inativos (entram mesmo assim). */
  inactive: number;
}

/**
 * Converte o produto que vem com o item da compra no `Product` da tela de
 * etiquetas. Só os campos da etiqueta importam; o resto fica neutro.
 */
function toLabelProduct(p: PurchaseItemProduct): Product {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku ?? undefined,
    sku2: p.sku2 ?? undefined,
    price: p.price,
    preco_promocional: p.preco_promocional ?? undefined,
    label_text: p.label_text ?? null,
    is_active: p.is_active,
    short_description: '',
    purchase_date: '',
    current_stock: 0,
    min_stock: 0,
    created_at: '',
    updated_at: '',
  };
}

/**
 * Etiquetas de uma compra: uma por peça comprada. Linhas repetidas do mesmo
 * produto somam; item sem produto (apagado) fica de fora. Produtos inativos
 * entram: a peça chegou e precisa de etiqueta mesmo fora da vitrine.
 */
export function labelSelectionFromPurchase(purchase: PurchaseWithItems): PurchaseLabelSelection {
  const quantities: Record<number, number> = {};
  const products = new Map<number, Product>();

  for (const item of purchase.items) {
    const product = item.products;
    if (!product || item.quantity <= 0) continue;
    quantities[product.id] = (quantities[product.id] ?? 0) + item.quantity;
    if (!products.has(product.id)) products.set(product.id, toLabelProduct(product));
  }

  const list = [...products.values()];
  return {
    quantities,
    products: list,
    pieces: Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    inactive: list.filter((p) => !p.is_active).length,
  };
}
