/**
 * Transfer Batches Service
 * --------------------
 * Transferência de peças em lote entre estoques (Central ↔ revendedoras):
 * prévia da planilha, "trazer tudo da revendedora", confirmação, histórico
 * e romaneio. Tipos espelhados de lumike-api/src/transfer-batches.
 */

import { api, PaginatedResponse } from '../api';

/** null = Estoque Lumilee (Central); número = id da revendedora. */
export type StockLocationId = number | null;

/** Peça pronta para transferir (linhas da planilha já somadas por código). */
export interface TransferBatchItemPreview {
  product_id: number;
  sku: string | null;
  sku2: string | null;
  name: string;
  price: number;
  /** Quantidade a transferir (editável na prévia, até `available`). */
  quantity: number;
  /** Quanto a origem tem desta peça. */
  available: number;
  /** Linhas da planilha; vazio no "trazer tudo". */
  row_numbers: number[];
}

export interface TransferBatchErrorRow {
  row_numbers: number[];
  code: string;
  reason: string;
}

export interface TransferBatchPreviewResponse {
  validos: TransferBatchItemPreview[];
  erros: TransferBatchErrorRow[];
}

/** `*_user_id` / `*_name` nulos = Estoque Lumilee (Central). */
export interface TransferBatchSummary {
  id: number;
  from_user_id: number | null;
  from_name: string | null;
  to_user_id: number | null;
  to_name: string | null;
  notes: string | null;
  total_items: number;
  total_quantity: number;
  created_by_name: string | null;
  created_at: string;
}

export interface TransferBatchDetailItem {
  product_id: number;
  sku: string | null;
  sku2: string | null;
  name: string;
  price: number;
  quantity: number;
}

export interface TransferBatchDetail extends TransferBatchSummary {
  items: TransferBatchDetailItem[];
}

export interface CreateTransferBatchInput {
  from_user_id: StockLocationId;
  to_user_id: StockLocationId;
  notes?: string;
  items: { product_id: number; quantity: number }[];
}

/** Formato do local na URL/formulário: 'central' ou o id. */
export function toLocationParam(id: StockLocationId): string {
  return id === null ? 'central' : String(id);
}

const BASE = '/inventory/transfer-batches';

export const transferBatchesService = {
  /** Sobe a planilha e devolve a prévia (nada é transferido ainda). */
  async preview(
    file: File,
    fromUserId: StockLocationId,
    toUserId: StockLocationId,
  ): Promise<TransferBatchPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('from_user_id', toLocationParam(fromUserId));
    formData.append('to_user_id', toLocationParam(toUserId));
    const { data } = await api.post<TransferBatchPreviewResponse>(`${BASE}/preview`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** Tudo que a revendedora tem agora, no formato da prévia. */
  async previewAll(fromUserId: number): Promise<TransferBatchPreviewResponse> {
    const { data } = await api.get<TransferBatchPreviewResponse>(
      `${BASE}/preview-all?from_user_id=${fromUserId}`,
    );
    return data;
  },

  /** Transfere as peças (tudo ou nada no banco). Devolve o id do lote. */
  async create(input: CreateTransferBatchInput): Promise<{ id: number }> {
    const { data } = await api.post<{ id: number }>(BASE, input);
    return data;
  },

  async list(
    page = 1,
    limit = 20,
    location?: StockLocationId,
  ): Promise<PaginatedResponse<TransferBatchSummary>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (location !== undefined) params.append('location', toLocationParam(location));
    const { data } = await api.get<PaginatedResponse<TransferBatchSummary>>(
      `${BASE}?${params.toString()}`,
    );
    return data;
  },

  async getById(id: number): Promise<TransferBatchDetail> {
    const { data } = await api.get<TransferBatchDetail>(`${BASE}/${id}`);
    return data;
  },
};
