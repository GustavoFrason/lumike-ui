'use client';

import { useEffect } from 'react';
import { usePurchases } from '@/lib/hooks/use-purchases';
import { DataTable } from '@/components/ui/data-table';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { PlusCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default function PurchasesListPage() {
  const { purchases, loading, error, loadPurchases } = usePurchases();

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  if (loading)
    return <Loading size="lg" text="Carregando histórico de compras..." className="py-12" />;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Entradas de Estoque</h1>
          <p className="text-sm text-zinc-500">Histórico de lotes comprados de fornecedores.</p>
        </div>
        <Link
          href="/admin/compras/nova"
          className="flex items-center gap-2 px-4 py-2 bg-(--lumilee-gold) text-white rounded-lg hover:opacity-90 transition shadow-sm font-medium"
        >
          <PlusCircle className="h-4 w-4" />
          Registrar Compra
        </Link>
      </div>

      <ErrorMessage message={error || ''} />

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <DataTable
          data={purchases}
          columns={[
            {
              key: 'id',
              header: 'ID',
              render: (item) => <span className="font-medium text-zinc-500">#{item.id}</span>,
            },
            {
              key: 'supplier',
              header: 'Fornecedor',
              render: (item) => (
                <span className="font-semibold text-zinc-900">{item.suppliers?.name || 'N/I'}</span>
              ),
            },
            {
              key: 'created_at',
              header: 'Data',
              render: (item) => (
                <span className="text-zinc-600">{formatDate(item.created_at)}</span>
              ),
            },
            {
              key: 'total_amount',
              header: 'Valor Total',
              render: (item) => (
                <span className="font-bold text-zinc-900">
                  {formatCurrency(item.total_amount || 0)}
                </span>
              ),
            },
            {
              key: 'items_count',
              header: 'Itens',
              render: (item) => (
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Package className="h-4 w-4" />
                  <span>{item.items_count || 0}</span>
                </div>
              ),
            },
          ]}
          emptyTitle="Nenhuma compra registrada"
          emptyDescription="As entradas de estoque aparecerão aqui após serem registradas."
        />
      </div>
    </section>
  );
}
