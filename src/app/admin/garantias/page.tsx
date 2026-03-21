'use client';

import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { Shield, Clock, CheckCircle, AlertCircle, Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { Loading } from '@/components/ui/loading';
import { warrantiesService, Warranty, WarrantyStatus } from '@/lib/services/warranties.service';
import { WarrantyModal } from './WarrantyModal';

const statusMap: Record<WarrantyStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800' },
  analyzing: { label: 'Em Análise', color: 'bg-blue-100 text-blue-800' },
  factory: { label: 'Na Fábrica', color: 'bg-purple-100 text-purple-800' },
  ready: { label: 'Pronta', color: 'bg-green-100 text-green-800' },
  finished: { label: 'Finalizada', color: 'bg-zinc-100 text-zinc-800' },
  rejected: { label: 'Recusada', color: 'bg-red-100 text-red-800' },
};

const typeMap: Record<string, string> = {
  plating: 'Banho',
  break: 'Quebra',
  stone_loss: 'Queda de Pedra',
  other: 'Outros',
};

export default function GarantiasPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [listRes, statsRes] = await Promise.all([
          warrantiesService.findAll(1, 100),
          warrantiesService.getStats(),
        ]);
        setWarranties(listRes.data || []);
        setStats(statsRes);
      } catch (error) {
        console.error('Erro ao carregar garantias:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshTrigger]);

  const handleUpdateStatus = async (id: string, status: WarrantyStatus) => {
    try {
      await warrantiesService.update(id, { status });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<Warranty>[] = [
    {
      key: 'created_at',
      header: 'Data',
      render: (item) => (
        <div className="text-xs text-zinc-500">
          {new Date(item.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'customers',
      header: 'Cliente',
      render: (item) => (
        <div className="flex flex-col text-left">
          {item.origin === 'stock' ? (
            <span className="font-bold text-amber-600 tracking-tight flex items-center gap-1">
              <Shield className="h-3 w-3" /> ESTOQUE PRÓPRIO
            </span>
          ) : (
            <>
              <span className="font-semibold text-zinc-900">
                {item.customers?.name || 'Cliente não identificado'}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                {item.customers?.whatsapp || item.customers?.email || '-'}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'origin',
      header: 'Origem',
      render: (item) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border ${item.origin === 'stock' ? 'bg-amber-600 text-white border-amber-700' : 'bg-zinc-800 text-white border-zinc-900'}`}
        >
          {item.origin === 'stock' ? 'Estoque' : 'Venda'}
        </span>
      ),
    },
    {
      key: 'products',
      header: 'Produto',
      render: (item) => (
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium">{item.products?.name}</span>
          <span className="text-xs text-zinc-400">SKU: {item.products?.sku}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (item) => (
        <span className="text-xs bg-zinc-50 px-2 py-1 rounded border border-zinc-100">
          {typeMap[item.type] || item.type}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <select
          value={item.status}
          onChange={(e) => handleUpdateStatus(item.id, e.target.value as WarrantyStatus)}
          className={`text-xs font-bold px-2 py-1 rounded-full border-none cursor-pointer focus:ring-2 focus:ring-primary-gold ${statusMap[item.status].color}`}
        >
          {Object.entries(statusMap).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (window.location.href = `/admin/garantias/${item.id}`)}
        >
          Ver
        </Button>
      ),
    },
  ];

  if (loading) return <Loading size="lg" text="Carregando garantias..." />;

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Garantias' }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-zinc-900">Gestão de Garantias</h1>
          <p className="text-zinc-500">
            Controle rigoroso de peças com defeito e prazos de acerto.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-gold"
            onChange={(e) => {
              const origin = e.target.value;
              warrantiesService
                .findAll(1, 100, origin ? { origin } : {})
                .then((res) => setWarranties(res.data || []));
            }}
          >
            <option value="">Todas as Origens</option>
            <option value="sold">Vendas (Clientes)</option>
            <option value="stock">Estoque Próprio</option>
          </select>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-primary-gold text-white hover:bg-yellow-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Chamado
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900">{stats?.pending || 0}</h3>
          <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest font-bold text-[10px]">
            Pendentes
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900">{stats?.analyzing || 0}</h3>
          <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest font-bold text-[10px]">
            Em Análise
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900">{stats?.factory || 0}</h3>
          <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest font-bold text-[10px]">
            Na Fábrica
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900">{stats?.ready || 0}</h3>
          <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest font-bold text-[10px]">
            Prontas para Troca
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <DataTable
          data={warranties}
          columns={columns}
          emptyTitle="Nenhuma garantia registrada"
          emptyDescription="Os chamados de garantia aparecerão aqui para acompanhamento."
        />
      </div>

      {showModal && (
        <WarrantyModal
          onClose={() => setShowModal(false)}
          onSave={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </section>
  );
}
