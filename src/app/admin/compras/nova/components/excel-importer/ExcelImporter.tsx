'use client';

import { useRef, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { purchaseImportService } from '@/lib/services/purchase-import.service';
import { Category } from '@/lib/services/categories.service';
import { Supplier } from '@/lib/services/suppliers.service';
import { getErrorMessage } from '@/lib/utils';
import { getTodayInSaoPaulo } from '@/lib/formatters';
import { ExcelUploadPrompt } from './ExcelUploadPrompt';
import { ImportPreviewSummary } from './ImportPreviewSummary';
import { NewProductsTable } from './NewProductsTable';
import { UpdateStockTable } from './UpdateStockTable';
import { NonCatalogList } from './NonCatalogList';
import { ErrorsList } from './ErrorsList';
import { ExcelImporterFooter } from './ExcelImporterFooter';
import { ConfirmImportResult, ImportPreviewResponse, NewProductRow, UpdateStockRow } from './types';

interface ExcelImporterProps {
  categories: Category[];
  suppliers: Supplier[];
  onConfirm: (result: ConfirmImportResult) => void;
  onCancel: () => void;
}

export function ExcelImporter({ categories, suppliers, onConfirm, onCancel }: ExcelImporterProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  // Data real da compra — pode ser retroativa (comprou semana passada,
  // sobe a planilha só hoje). Default: hoje no fuso de Brasília, não o do
  // servidor/navegador (ver getTodayInSaoPaulo).
  const [purchaseDate, setPurchaseDate] = useState(() => getTodayInSaoPaulo());
  // Sem padrão de propósito: escolher sempre evita importar a compra de um
  // fornecedor como se fosse de outro.
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await purchaseImportService.preview(file);
      setPreview(result);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao ler a planilha.'));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function updateNewProduct(rowNumber: number, patch: Partial<NewProductRow>) {
    setPreview((prev) =>
      prev
        ? {
            ...prev,
            novos: prev.novos.map((r) => (r.row_number === rowNumber ? { ...r, ...patch } : r)),
          }
        : prev,
    );
  }

  function removeNewProduct(rowNumber: number) {
    setPreview((prev) =>
      prev ? { ...prev, novos: prev.novos.filter((r) => r.row_number !== rowNumber) } : prev,
    );
  }

  function updateStockRow(rowNumber: number, patch: Partial<UpdateStockRow>) {
    setPreview((prev) =>
      prev
        ? {
            ...prev,
            atualizacoes: prev.atualizacoes.map((r) =>
              r.row_number === rowNumber ? { ...r, ...patch } : r,
            ),
          }
        : prev,
    );
  }

  function removeStockRow(rowNumber: number) {
    setPreview((prev) =>
      prev
        ? { ...prev, atualizacoes: prev.atualizacoes.filter((r) => r.row_number !== rowNumber) }
        : prev,
    );
  }

  async function handleConfirm() {
    if (!preview || supplierId === '') return;

    const items = [
      // quantity/unit_cost/price vão POR UNIDADE COMPRADA (kit, quando for
      // kit) + pieces_per_kit — a API desmembra em peças no confirm.
      ...preview.novos.map((r) => ({
        is_new: true,
        sku2: r.sku2,
        sku2_alt: r.sku2_alt?.trim() || undefined,
        name: r.name,
        category_id: r.category_id,
        quantity: r.quantity,
        unit_cost: r.unit_cost,
        // Vem da planilha ("Valor de Venda") quando preenchido, senão da
        // regra padrão (unit_cost×3) — nos dois casos, editável no preview
        // (NewProductsTable) antes de chegar aqui.
        price: r.suggested_price,
        pieces_per_kit: r.pieces_per_kit || 1,
      })),
      ...preview.atualizacoes.map((r) => ({
        is_new: false,
        product_id: r.existing_product.id,
        quantity: r.quantity,
        unit_cost: r.unit_cost,
        pieces_per_kit: r.pieces_per_kit || 1,
      })),
    ];

    try {
      setConfirming(true);
      setError(null);
      const result = await purchaseImportService.confirm(items, { supplierId, purchaseDate });
      onConfirm(result);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao confirmar importação.'));
    } finally {
      setConfirming(false);
    }
  }

  const itemCount = (preview?.novos.length ?? 0) + (preview?.atualizacoes.length ?? 0);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between gap-4 bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-(--lumilee-gold)/10 rounded-lg text-(--lumilee-gold)">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-playfair font-bold text-zinc-900">
              Importar Planilha de Compra
            </h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Passo 1: Validação de Lote
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label
              htmlFor="import-supplier"
              className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5"
            >
              Fornecedor
            </label>
            <select
              id="import-supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : '')}
              className={`border rounded-lg px-3 py-1.5 text-sm font-medium bg-white ${
                supplierId === '' ? 'border-amber-300 text-zinc-400' : 'text-zinc-900'
              }`}
            >
              <option value="">Selecione...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Data da Compra
            </label>
            <input
              type="date"
              value={purchaseDate}
              max={getTodayInSaoPaulo()}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm font-medium bg-white"
            />
          </div>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-600 transition p-2 hover:bg-zinc-100 rounded-full"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[70vh] scrollbar-thin">
        {!preview ? (
          <ExcelUploadPrompt
            loading={loading}
            error={error}
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
          />
        ) : (
          <div className="space-y-6">
            <ImportPreviewSummary preview={preview} />
            <NewProductsTable
              rows={preview.novos}
              categories={categories}
              onUpdate={updateNewProduct}
              onRemove={removeNewProduct}
            />
            <UpdateStockTable
              rows={preview.atualizacoes}
              selectedSupplierId={supplierId}
              suppliers={suppliers}
              onUpdate={updateStockRow}
              onRemove={removeStockRow}
            />
            <NonCatalogList rows={preview.naoCatalogaveis} />
            <ErrorsList rows={preview.erros} />
            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm font-bold border border-red-100">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <ExcelImporterFooter
        itemCount={itemCount}
        confirming={confirming}
        blockedReason={supplierId === '' ? 'Escolha o fornecedor da compra' : undefined}
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
