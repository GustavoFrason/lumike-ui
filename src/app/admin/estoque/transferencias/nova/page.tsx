'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { usersService, User } from '@/lib/services/users.service';
import {
  StockLocationId,
  toLocationParam,
  transferBatchesService,
  TransferBatchPreviewResponse,
} from '@/lib/services/transfer-batches.service';
import { getErrorMessage } from '@/lib/utils';
import { TransferUploadPrompt } from '../components/TransferUploadPrompt';
import { TransferBatchPreview } from '../components/TransferBatchPreview';
import { TransferBatchFooter } from '../components/TransferBatchFooter';
import {
  CENTRAL_LABEL,
  locationLabel,
  parseLocationParam,
  removeItem,
  setItemQuantity,
  summarizeItems,
} from '../components/transfer-preview';

const fieldClass =
  'w-full py-2 px-3 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-(--lumilee-gold) focus:border-transparent outline-none transition bg-white text-zinc-700';
const labelClass = 'text-[10px] font-bold text-zinc-400 uppercase tracking-widest';

export default function NovaTransferenciaPage() {
  // useSearchParams precisa de Suspense no App Router (senão o build falha
  // ao pré-renderizar a página).
  return (
    <Suspense fallback={<Loading size="lg" className="py-12" />}>
      <NovaTransferencia />
    </Suspense>
  );
}

function NovaTransferencia() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sellers, setSellers] = useState<User[]>([]);
  const [fromUserId, setFromUserId] = useState<StockLocationId>(null);
  const [toUserId, setToUserId] = useState<StockLocationId>(null);
  const [notes, setNotes] = useState('');

  const [preview, setPreview] = useState<TransferBatchPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appliedQueryRef = useRef(false);

  const loadAll = useCallback(async (resellerId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await transferBatchesService.previewAll(resellerId);
      if (result.validos.length === 0) {
        setError('Essa revendedora não tem nenhuma peça no momento.');
        return;
      }
      setPreview(result);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao buscar o estoque da revendedora.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Revendedoras + atalho "Devolver tudo" (?origem=<id>&destino=central).
  useEffect(() => {
    usersService
      .getSellers()
      .then((list) => {
        setSellers(list);
        if (appliedQueryRef.current) return;
        appliedQueryRef.current = true;

        const origem = parseLocationParam(searchParams.get('origem'));
        const destino = parseLocationParam(searchParams.get('destino'));
        if (origem !== undefined) setFromUserId(origem);
        if (destino !== undefined) setToUserId(destino);
        if (typeof origem === 'number' && destino === null) {
          loadAll(origem);
        }
      })
      .catch(() => setError('Erro ao carregar as revendedoras.'));
  }, [searchParams, loadAll]);

  // /users/sellers só traz revendedoras ativas. Se a origem veio do atalho
  // e não está na lista (ex: desativada), ela entra como opção mesmo assim
  // — senão o select mostraria "Central" com outra origem escolhida.
  const fromOptions: { id: number; name: string }[] =
    fromUserId !== null && !sellers.some((s) => s.id === fromUserId)
      ? [...sellers, { id: fromUserId, name: `Revendedora #${fromUserId}` }]
      : sellers;

  const sameLocation = fromUserId === toUserId;
  const blockedReason = sameLocation ? 'Escolha uma origem diferente do destino.' : null;
  const fromLabel = locationLabel(fromUserId, fromOptions);
  const toLabel = locationLabel(toUserId, sellers);

  /** Trocar a origem/destino invalida a prévia (o disponível depende da origem). */
  function changeLocation(which: 'from' | 'to', value: string) {
    const id = value === 'central' ? null : Number(value);
    if (which === 'from') setFromUserId(id);
    else setToUserId(id);
    setPreview(null);
    setError(null);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      setPreview(await transferBatchesService.preview(file, fromUserId, toUserId));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao ler a planilha.'));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleConfirm() {
    if (!preview || preview.validos.length === 0) return;

    const totals = summarizeItems(preview.validos);
    const ok = confirm(
      `Transferir ${totals.units} unidade(s) de ${totals.pieces} peça(s)\n` +
        `de: ${fromLabel}\npara: ${toLabel}?`,
    );
    if (!ok) return;

    setConfirming(true);
    setError(null);
    try {
      const { id } = await transferBatchesService.create({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        notes: notes.trim() || undefined,
        items: preview.validos.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });
      router.push(`/admin/estoque/transferencias/${id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao transferir as peças.'));
      setConfirming(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <Link
          href="/admin/estoque/transferencias"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 mb-3"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Voltar para as transferências
        </Link>
        <h1 className="text-3xl font-serif text-zinc-900 font-medium">
          Nova transferência em lote
        </h1>
        <p className="text-zinc-500 mt-1">
          Escolha de onde as peças saem e para onde vão, depois suba a planilha.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <label className="space-y-1">
          <span className={labelClass}>Origem</span>
          <select
            className={fieldClass}
            value={toLocationParam(fromUserId)}
            onChange={(e) => changeLocation('from', e.target.value)}
            disabled={confirming}
          >
            <option value="central">{CENTRAL_LABEL}</option>
            {fromOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <ArrowRight className="hidden md:block h-5 w-5 text-zinc-300 mb-2.5" />

        <label className="space-y-1">
          <span className={labelClass}>Destino</span>
          <select
            className={fieldClass}
            value={toLocationParam(toUserId)}
            onChange={(e) => changeLocation('to', e.target.value)}
            disabled={confirming}
          >
            <option value="central">{CENTRAL_LABEL}</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 md:col-span-3">
          <span className={labelClass}>Observação (opcional)</span>
          <input
            type="text"
            maxLength={500}
            placeholder="Ex: mala de outubro, devolução para o acerto..."
            className={fieldClass}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={confirming}
          />
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6">
          {!preview ? (
            <TransferUploadPrompt
              loading={loading}
              error={error}
              blockedReason={blockedReason}
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              originResellerName={fromUserId !== null ? fromLabel : null}
              onLoadAll={() => fromUserId !== null && loadAll(fromUserId)}
            />
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-zinc-600">
                De <span className="font-bold text-zinc-900">{fromLabel}</span> para{' '}
                <span className="font-bold text-zinc-900">{toLabel}</span>
              </p>
              <TransferBatchPreview
                preview={preview}
                onQuantityChange={(productId, quantity) =>
                  setPreview((prev) =>
                    prev
                      ? { ...prev, validos: setItemQuantity(prev.validos, productId, quantity) }
                      : prev,
                  )
                }
                onRemove={(productId) =>
                  setPreview((prev) =>
                    prev ? { ...prev, validos: removeItem(prev.validos, productId) } : prev,
                  )
                }
              />
              {error && (
                <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm font-bold border border-red-100">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {preview && (
          <TransferBatchFooter
            totals={summarizeItems(preview.validos)}
            confirming={confirming}
            onClear={() => {
              setPreview(null);
              setError(null);
            }}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </section>
  );
}
