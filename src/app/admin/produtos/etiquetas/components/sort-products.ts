import type { Product } from '@/lib/services/products.service';

/**
 * Ordena por código do produto (o SKU interno mostrado na lista de seleção,
 * ex: "205") crescente — pedido direto pra imprimir/organizar as etiquetas
 * na mesma ordem física que as peças ficam guardadas (por código, do menor
 * pro maior).
 *
 * Compara como NÚMERO, não como texto: numa comparação de string, "10"
 * vem antes de "9" (compara caractere a caractere: '1' < '9'), o que
 * quebraria a ordem assim que o catálogo passasse de 9 produtos.
 */
export function compareProductsBySku(a: Product, b: Product): number {
  const skuA = Number(a.sku);
  const skuB = Number(b.sku);
  const validA = Number.isFinite(skuA);
  const validB = Number.isFinite(skuB);

  if (validA && validB) return skuA - skuB;
  if (validA) return -1; // sku numérico válido sempre antes de ausente/não numérico
  if (validB) return 1;
  return a.id - b.id; // nenhum dos dois tem sku numérico usável — cai no id
}
