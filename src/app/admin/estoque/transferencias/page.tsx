'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, Plus } from 'lucide-react';
import { Column, DataTable } from '@/components/ui/data-table';
import { ErrorMessage } from '@/components/ui/error-message';
import { Pagination } from '@/components/ui/pagination';
import { PaginationInfo } from '@/components/ui/pagination-info';
import { formatDateTime } from '@/lib/formatters';
import { usersService, User } from '@/lib/services/users.service';
import {
  StockLocationId,
  transferBatchesService,
  TransferBatchSummary,
} from '@/lib/services/transfer-batches.service';
import { getErrorMessage } from '@/lib/utils';
import { batchLocationLabel, CENTRAL_LABEL } from './components/transfer-preview';

const ITEMS_PER_PAGE = 20;

const columns: Column<TransferBatchSummary>[] = [
  {
    key: 'id',
    header: 'Lote',
    render: (batch) => <span className="font-mono text-xs text-zinc-500">#{batch.id}</span>,
  },
  {
    key: 'date',
    header: 'Data',
    render: (batch) => <span className="text-zinc-600">{formatDateTime(batch.created_at)}</span>,
  },
  {
    key: 'route',
    header: 'Origem → Destino',
    render: (batch) => (
      <span className="inline-flex items-center gap-1.5 font-medium text-zinc-800">
        {batchLocationLabel(batch.from_user_id, batch.from_name)}
        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
        {batchLocationLabel(batch.to_user_id, batch.to_name)}
      </span>
    ),
  },
  {
    key: 'totals',
    header: 'Peças',
    className: 'text-right',
    render: (batch) => (
      <span className="whitespace-nowrap">
        <span className="font-semibold text-zinc-800">{batch.total_quantity}</span>
        <span className="text-zinc-400 text-xs ml-1">
          ({batch.total_items} {batch.total_items === 1 ? 'item' : 'itens'})
        </span>
      </span>
    ),
  },
  {
    key: 'notes',
    header: 'Observação',
    render: (batch) => <span className="text-zinc-500 text-xs">{batch.notes || '-'}</span>,
  },
  {
    key: 'creator',
    header: 'Feito por',
    render: (batch) => (
      <span className="text-zinc-500 text-xs">{batch.created_by_name || '-'}</span>
    ),
  },
  {
    key: 'actions',
    header: '',
    className: 'text-right',
    render: (batch) => (
      <Link
        href={`/admin/estoque/transferencias/${batch.id}`}
        className="text-(--lumilee-gold) hover:underline text-xs font-bold whitespace-nowrap"
      >
        Ver romaneio
      </Link>
    ),
  },
];

export default function TransferenciasPage() {
  const [batches, setBatches] = useState<TransferBatchSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [location, setLocation] = useState<StockLocationId | undefined>(undefined);
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersService
      .getSellers()
      .then(setSellers)
      .catch(() => setError('Erro ao carregar as revendedoras.'));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    transferBatchesService
      .list(page, ITEMS_PER_PAGE, location)
      .then((res) => {
        if (cancelled) return;
        setBatches(res.data);
        setTotal(res.pagination.total);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Erro ao carregar as transferências.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, location]);

  function handleLocationChange(value: string) {
    setLocation(value === 'all' ? undefined : value === 'central' ? null : Number(value));
    setPage(1);
  }

  const locationValue =
    location === undefined ? 'all' : location === null ? 'central' : String(location);

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/estoque"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 mb-3"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar pro Estoque
          </Link>
          <h1 className="text-3xl font-serif text-zinc-900 font-medium">Transferências em lote</h1>
          <p className="text-zinc-500 mt-1">
            Histórico das peças enviadas e devolvidas entre o estoque Lumilee e as revendedoras
          </p>
        </div>
        <Link
          href="/admin/estoque/transferencias/nova"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-(--lumilee-gold) text-white rounded-lg hover:opacity-90 transition font-medium"
        >
          <Plus className="h-4 w-4" /> Nova transferência
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Local</span>
        <select
          className="w-full sm:w-72 py-2 px-3 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-(--lumilee-gold) focus:border-transparent outline-none transition bg-white text-zinc-700"
          value={locationValue}
          onChange={(e) => handleLocationChange(e.target.value)}
        >
          <option value="all">Todos os locais</option>
          <option value="central">{CENTRAL_LABEL}</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <ErrorMessage message={error || ''} />

      <DataTable
        data={batches}
        columns={columns}
        loading={loading && batches.length === 0}
        emptyTitle="Nenhuma transferência em lote"
        emptyDescription={
          location === undefined
            ? 'As transferências feitas por planilha ou "trazer tudo" aparecem aqui.'
            : 'Nenhum lote saiu ou chegou neste local.'
        }
        emptyAction={
          <Link
            href="/admin/estoque/transferencias/nova"
            className="px-4 py-2 bg-(--lumilee-gold) text-white rounded-lg hover:opacity-90 transition"
          >
            Nova transferência
          </Link>
        }
      />

      {total > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-2">
          <PaginationInfo currentPage={page} totalItems={total} itemsPerPage={ITEMS_PER_PAGE} />
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
            onPageChange={(next) => {
              setPage(next);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </section>
  );
}
