/**
 * Purchase Import Service
 * --------------------
 * Importação de compra via planilha Excel da Zarpellon Joias.
 */

import { api } from '../api';

export interface ImportRow {
  row_number: number;
  /** Valor literal da célula "Produto" — sem normalização, nem strip nem padding de zero à esquerda. */
  sku2: string;
  name: string;
  quantity: number;
  unit_cost: number;
  duplicated_in_file?: boolean;
}

export interface NewProductRow extends ImportRow {
  category_id: number;
  category_name: string;
  category_low_confidence: boolean;
  suggested_price: number;
}

export interface ExistingProductRef {
  id: number;
  name: string;
  current_stock: number;
}

export interface UpdateStockRow extends ImportRow {
  existing_product: ExistingProductRef;
}

export interface NonCatalogRow extends ImportRow {
  matched_keyword: string;
}

export interface ErrorRow {
  row_number: number;
  sku2: string;
  name: string;
  reason: string;
}

export interface ImportPreviewResponse {
  novos: NewProductRow[];
  atualizacoes: UpdateStockRow[];
  naoCatalogaveis: NonCatalogRow[];
  erros: ErrorRow[];
}

export interface ConfirmImportItem {
  is_new: boolean;
  /** Obrigatório quando is_new = false. */
  product_id?: number;
  /** Obrigatório quando is_new = true. */
  sku2?: string;
  /** Obrigatório quando is_new = true. */
  name?: string;
  category_id?: number;
  quantity: number;
  unit_cost: number;
}

export interface ConfirmImportResult {
  purchase_id: number;
  created: number;
  updated: number;
}

export const purchaseImportService = {
  /** Sobe a planilha e devolve o preview classificado (nada é persistido ainda). */
  async preview(file: File): Promise<ImportPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ImportPreviewResponse>('/compras/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** Persiste os itens já revisados pelo usuário (só "novos" + "atualizações"). */
  async confirm(
    items: ConfirmImportItem[],
    notes?: string,
    purchaseDate?: string,
  ): Promise<ConfirmImportResult> {
    const { data } = await api.post<ConfirmImportResult>('/compras/import/confirm', {
      items,
      notes,
      purchase_date: purchaseDate,
    });
    return data;
  },
};
