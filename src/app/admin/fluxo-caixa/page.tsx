'use client';

import { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/ui/data-table';
import { Loading } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/formatters';
import { ArrowUpCircle, ArrowDownCircle, Info, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionModal, CreateCashFlowEntry } from './TransactionModal';
import { FinancialSummaryChart, CategoryPieChart, DailyStat, CategoryStat } from './charts';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

export interface CashFlowEntry {
  id: number;
  type: 'IN' | 'OUT';
  category: string;
  amount: number;
  description: string | null;
  order_id: number | null;
  user_id: number | null;
  created_at: string;
  users?: { name: string } | null;
}

interface CashFlowStats {
  dailyStats: DailyStat[];
  categoryStats: CategoryStat[];
}

export default function FluxoCaixaPage() {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState<CashFlowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [entriesRes, balanceRes, statsRes] = await Promise.all([
          fetch('/api/cash-flow'),
          fetch('/api/cash-flow/balance'),
          fetch('/api/cash-flow/stats?days=30'),
        ]);
        const entriesData = await entriesRes.json();
        const balanceData = await balanceRes.json();
        const statsData = await statsRes.json();

        setEntries(Array.isArray(entriesData) ? entriesData : []);
        setBalance(balanceData.balance || 0);
        setStats(statsData?.dailyStats ? statsData : null); // Simple check if stats look valid
      } catch (error) {
        console.error('Erro ao carregar fluxo de caixa:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshTrigger]);

  const handleCreateEntry = async (data: CreateCashFlowEntry) => {
    try {
      await api.post('/cash-flow', data);
      setRefreshTrigger((prev) => prev + 1); // Reload list
    } catch (error) {
      console.error('Erro ao criar lançamento:', getErrorMessage(error));
      throw error; // Let modal handle/show error if needed
    }
  };

  const columns: Column<CashFlowEntry>[] = [
    {
      key: 'type',
      header: 'Tipo',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.type === 'IN' ? (
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={`font-bold ${item.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
            {item.type === 'IN' ? 'Entrada' : 'Saída'}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (item) => <span className="capitalize">{item.category}</span>,
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (item) => (
        <span className={`font-semibold ${item.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
          {item.type === 'IN' ? '+' : '-'} {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (item) => <span className="text-zinc-600 text-sm">{item.description}</span>,
    },
    {
      key: 'created_at',
      header: 'Data/Hora',
      render: (item) => (
        <div className="text-xs text-zinc-500">{new Date(item.created_at).toLocaleString()}</div>
      ),
    },
    {
      key: 'user',
      header: 'Responsável',
      render: (item) => <span className="text-xs">{item.users?.name || 'Sistema'}</span>,
    },
  ];

  if (loading) return <Loading size="lg" text="Carregando lançamentos..." />;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fluxo de Caixa</h1>
          <p className="text-sm text-zinc-500">
            Acompanhamento de entradas e saídas reais do seu negócio.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowModal(true)}
            className="bg-[var(--lumilee-gold)] text-white hover:bg-yellow-600"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Button>

          <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Saldo em Caixa
            </span>
            <span
              className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Receitas vs Despesas (30 dias)
            </h3>
            <FinancialSummaryChart data={stats.dailyStats} />
          </div>
          <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Distribuição por Categoria</h3>
            <CategoryPieChart data={stats.categoryStats} />
          </div>
        </div>
      )}

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Nota:</strong> O Fluxo de Caixa começou a ser registrado hoje. Vendas e estornos
          realizados anteriormente não aparecem nesta lista, mas os totais no dashboard continuam
          corretos considerando o histórico legado.
        </p>
      </div>

      <DataTable
        data={entries}
        columns={columns}
        emptyTitle="Nenhum lançamento hoje"
        emptyDescription="As movimentações financeiras aparecerão aqui."
      />

      {showModal && (
        <TransactionModal onClose={() => setShowModal(false)} onSave={handleCreateEntry} />
      )}
    </section>
  );
}
