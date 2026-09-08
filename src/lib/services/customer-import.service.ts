/**
 * Customer Import Service
 * --------------------
 * Carga de base de clientes via planilha Excel (tela /admin/clientes).
 * Mesmo padrão de purchase-import.service.ts.
 */

import { api } from '../api';

export interface CustomerImportRow {
  row_number: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  zipcode: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  duplicated_in_file?: boolean;
}

export interface ExistingCustomerRef {
  id: number;
  name: string;
  matched_by: 'email' | 'cpf' | 'phone';
}

export type NewCustomerRow = CustomerImportRow;

export interface DuplicateCustomerRow extends CustomerImportRow {
  existing_customer: ExistingCustomerRef;
}

export interface CustomerErrorRow {
  row_number: number;
  name: string;
  reason: string;
}

export interface CustomerImportPreviewResponse {
  novos: NewCustomerRow[];
  jaCadastrados: DuplicateCustomerRow[];
  erros: CustomerErrorRow[];
}

export interface ConfirmCustomerImportItem {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  zipcode?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
}

export interface ConfirmCustomerImportResult {
  created: number;
  skipped: number;
}

export const customerImportService = {
  /** Sobe a planilha e devolve o preview classificado (nada é persistido ainda). */
  async preview(file: File): Promise<CustomerImportPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<CustomerImportPreviewResponse>(
      '/clientes/import/preview',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  /** Persiste os clientes já revisados pelo usuário (só o bucket "novos"). */
  async confirm(items: ConfirmCustomerImportItem[]): Promise<ConfirmCustomerImportResult> {
    const { data } = await api.post<ConfirmCustomerImportResult>('/clientes/import/confirm', {
      items,
    });
    return data;
  },
};
