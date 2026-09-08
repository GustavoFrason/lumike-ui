'use client';

import { useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { customerImportService } from '@/lib/services/customer-import.service';
import { getErrorMessage } from '@/lib/utils';
import { CustomersUploadPrompt } from './CustomersUploadPrompt';
import { CustomersImportPreview } from './CustomersImportPreview';
import { CustomersImporterFooter } from './CustomersImporterFooter';
import type {
  ConfirmCustomerImportResult,
  CustomerImportPreviewResponse,
  NewCustomerRow,
} from '@/lib/services/customer-import.service';

interface CustomersImporterProps {
  onConfirm: (result: ConfirmCustomerImportResult) => void;
  onCancel: () => void;
}

export function CustomersImporter({ onConfirm, onCancel }: CustomersImporterProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<CustomerImportPreviewResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await customerImportService.preview(file);
      setPreview(result);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao ler a planilha.'));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function updateNewCustomer(rowNumber: number, patch: Partial<NewCustomerRow>) {
    setPreview((prev) =>
      prev
        ? {
            ...prev,
            novos: prev.novos.map((r) => (r.row_number === rowNumber ? { ...r, ...patch } : r)),
          }
        : prev,
    );
  }

  function removeNewCustomer(rowNumber: number) {
    setPreview((prev) =>
      prev ? { ...prev, novos: prev.novos.filter((r) => r.row_number !== rowNumber) } : prev,
    );
  }

  async function handleConfirm() {
    if (!preview) return;

    const items = preview.novos.map((r) => ({
      name: r.name,
      email: r.email || undefined,
      phone: r.phone || undefined,
      cpf: r.cpf || undefined,
      zipcode: r.zipcode || undefined,
      address: r.address || undefined,
      city: r.city || undefined,
      state: r.state || undefined,
      notes: r.notes || undefined,
    }));

    try {
      setConfirming(true);
      setError(null);
      const result = await customerImportService.confirm(items);
      onConfirm(result);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao confirmar importação.'));
    } finally {
      setConfirming(false);
    }
  }

  const itemCount = preview?.novos.length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between gap-4 bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-(--lumilee-gold)/10 rounded-lg text-(--lumilee-gold)">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-zinc-900">Importar Clientes</h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Carga por planilha
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-zinc-400 hover:text-zinc-600 transition p-2 hover:bg-zinc-100 rounded-full"
        >
          ✕
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[70vh] scrollbar-thin">
        {!preview ? (
          <CustomersUploadPrompt
            loading={loading}
            error={error}
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
          />
        ) : (
          <div className="space-y-6">
            <CustomersImportPreview
              preview={preview}
              onUpdate={updateNewCustomer}
              onRemove={removeNewCustomer}
            />
            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm font-bold border border-red-100">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <CustomersImporterFooter
        itemCount={itemCount}
        confirming={confirming}
        onClear={() => {
          setPreview(null);
          setError(null);
        }}
        onConfirm={handleConfirm}
        onCancel={onCancel}
      />
    </div>
  );
}
