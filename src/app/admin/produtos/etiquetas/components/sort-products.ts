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

/**
 * Filtra e ordena pela busca digitada na tela de Etiquetas.
 *
 * Antes: o termo não era aparado ("7 " não achava o item 7) e qualquer
 * produto que CONTIVESSE o número vinha misturado (17, 70, 107...). Agora,
 * do mais relevante pro menos:
 *   0. nº do item (sku) igual ao termo
 *   1. código Zarpellon (sku2 ou 2º código) igual ao termo
 *   2. nº do item começando pelo termo
 *   3. código Zarpellon começando pelo termo
 *   4. termo contido no nome, nos códigos ou no texto da etiqueta
 * Empate (e busca vazia): ordem crescente do nº do item.
 */
export function rankProductsForSearch(products: Product[], rawTerm: string): Product[] {
  const term = rawTerm.trim().toLowerCase();
  if (!term) return [...products].sort(compareProductsBySku);

  const lower = (value?: string | null) => (value ?? '').toLowerCase();
  const ranked: { product: Product; rank: number }[] = [];

  for (const product of products) {
    const sku = lower(product.sku);
    const codes = [lower(product.sku2), lower(product.sku2_alt)];

    let rank: number;
    if (sku === term) rank = 0;
    else if (codes.includes(term)) rank = 1;
    else if (sku.startsWith(term)) rank = 2;
    else if (codes.some((code) => code.startsWith(term))) rank = 3;
    else if (
      [lower(product.name), sku, ...codes, lower(product.label_text)].some((field) =>
        field.includes(term),
      )
    )
      rank = 4;
    else continue;

    ranked.push({ product, rank });
  }

  return ranked
    .sort((a, b) => a.rank - b.rank || compareProductsBySku(a.product, b.product))
    .map(({ product }) => product);
}
