/**
 * Estado do formulário de produto (ProductModal). Extraído pra um tipo
 * compartilhado porque cada seção do formulário virou seu próprio
 * componente — todas leem/escrevem o mesmo `form`.
 */
export interface ProductFormState {
  name: string;
  sku: string;
  sku2: string;
  /** 2º código da Zarpellon (alguns produtos têm dois). */
  sku2_alt: string;
  short_description: string;
  /** Linha extra impressa na etiqueta (ex: LINHA PRATA, ARO 16, 45cm). */
  label_text: string;
  description: string;
  price: string;
  preco_promocional: string;
  cost_price: string;
  purchase_date: string;
  current_stock: string;
  min_stock: string;
  category_id: string;
  supplier_id: string;
  colecao_id: string;
  collection: string;
  is_active: boolean;
  is_featured: boolean;
}

export type ProductFormChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
) => void;
