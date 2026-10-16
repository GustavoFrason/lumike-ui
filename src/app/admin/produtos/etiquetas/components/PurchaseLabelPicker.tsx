'use client';

import { useEffect, useState } from 'react';
import { PackageOpen, X } from 'lucide-react';
import { Purchase, purchasesService } from '@/lib/services/purchases.service';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/utils';

/** Compra cujas peças estão selecionadas agora. */
export interface AppliedPurchase {
  id: number;
  purchaseDate: string;
  supplierName: string | null;
  pieces: number;
  inactive: number;
}

interface PurchaseLabelPickerProps {
  applied: AppliedPurchase | null;
  /** Compra sendo carregada (desabilita o seletor). */
  loadingId: number | null;
  error: string | null;
  onSelect: (purchaseId: number) => void;
  onClear: () => void;
}

/** "31/08/2026 · Zarpellon Joias · 28 produtos (#4)" */
export function purchaseOptionLabel(p: Purchase): string {
  const products = `${p.items_count} ${p.items_count === 1 ? 'produto' : 'produtos'}`;
  return `${formatDate(p.purchase_date)} · ${p.suppliers?.name ?? 'Sem fornecedor'} · ${products} (#${p.id})`;
}

/**
 * "Etiquetas de uma compra": escolhe a compra pela data e seleciona uma
 * etiqueta por peça comprada (substitui a seleção atual).
 */
export function PurchaseLabelPicker({
  applied,
  loadingId,
  error,
  onSelect,
  onClear,
}: PurchaseLabelPickerProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    purchasesService
      .findAll(1, 50)
      .then(({ data }) => {
        if (!cancelled) setPurchases(data);
      })
      .catch((err) => {
        if (!cancelled) setListError(getErrorMessage(err, 'Erro ao carregar as compras.'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="print:hidden bg-white border border-zinc-200 rounded-lg px-4 py-3 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label
          htmlFor="purchase-label-picker"
          className="flex items-center gap-2 text-sm font-medium text-zinc-700 whitespace-nowrap"
        >
          <PackageOpen className="h-4 w-4 text-(--lumilee-gold)" />
          Etiquetas de uma compra
        </label>
        <select
          id="purchase-label-picker"
          value={applied?.id ?? ''}
          disabled={loadingId !== null}
          onChange={(e) => {
            if (e.target.value) onSelect(Number(e.target.value));
          }}
          className="flex-1 border rounded-lg px-3 py-1.5 text-sm bg-white disabled:opacity-60"
        >
          <option value="">
            {loadingId !== null ? 'Carregando a compra...' : 'Escolha a compra pela data...'}
          </option>
          {/* Compra aberta pela URL que não está entre as mais recentes. */}
          {applied && !purchases.some((p) => p.id === applied.id) && (
            <option value={applied.id}>
              {`${formatDate(applied.purchaseDate)} · ${applied.supplierName ?? 'Sem fornecedor'} (#${applied.id})`}
            </option>
          )}
          {purchases.map((p) => (
            <option key={p.id} value={p.id}>
              {purchaseOptionLabel(p)}
            </option>
          ))}
        </select>
      </div>

      {applied && (
        <div className="flex items-start justify-between gap-3 text-xs bg-amber-50 border border-amber-100 text-amber-900 rounded-lg px-3 py-2">
          <p>
            Seleção da compra <strong>#{applied.id}</strong> de{' '}
            <strong>{formatDate(applied.purchaseDate)}</strong>
            {applied.supplierName ? ` (${applied.supplierName})` : ''}:{' '}
            <strong>{applied.pieces} etiquetas</strong>, uma por peça.
            {applied.inactive > 0 &&
              ` Inclui ${applied.inactive} ${applied.inactive === 1 ? 'produto inativo' : 'produtos inativos'}.`}
          </p>
          <button
            type="button"
            onClick={onClear}
            className="text-amber-700 hover:text-amber-900 shrink-0"
            aria-label="Limpar seleção da compra"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {(error || listError) && <p className="text-xs text-red-600">{error || listError}</p>}
    </div>
  );
}
