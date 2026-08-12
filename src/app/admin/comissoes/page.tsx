'use client';

import { useState, useEffect } from 'react';
import { usersService, User } from '@/lib/services/users.service';
import { ordersService, Order } from '@/lib/services/orders.service';
import { formatCurrency } from '@/lib/formatters';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { DollarSign, TrendingUp, Filter, Download, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ComissoesPage() {
  const [sellers, setSellers] = useState<User[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Filtros
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [sellersData, ordersData] = await Promise.all([
        usersService.getSellers(),
        ordersService.getAll(1, 1000), // Busca uma boa quantidade para o relatório
      ]);
      setSellers(sellersData);
      setOrders(ordersData.data);
    } catch {
      setError('Erro ao carregar dados de comissões');
    } finally {
      setLoading(false);
    }
  }

  // Lógica de Filtragem e Cálculo
  const filteredOrders = orders.filter((order) => {
    const orderDate = order.created_at.split('T')[0];
    const matchDate = orderDate >= dateRange.start && orderDate <= dateRange.end;
    const matchSeller = selectedSellerId === 'all' || order.seller_id === Number(selectedSellerId);
    // Venda sem vendedora atribuída (PDV/balcão) não gera comissão pra
    // ninguém — sem esse filtro, order.seller_id null caía no default de
    // 20% mesmo assim, inflando o total com comissão "fantasma". Venda
    // cancelada também não deve contar (nem como venda, nem como pendente).
    const hasSeller = order.seller_id != null;
    const notCancelled = order.status !== 'cancelled';
    return matchDate && matchSeller && hasSeller && notCancelled;
  });

  const stats = filteredOrders.reduce(
    (acc, order) => {
      // Busca o vendedor para saber a taxa dele
      const seller = sellers.find((s) => s.id === order.seller_id);
      const rate = seller?.commission_rate ?? 20; // Default 20% só se a vendedora existir mas sem taxa configurada

      const commissionValue = (order.total_amount * rate) / 100;

      acc.totalSales += Number(order.total_amount);
      acc.totalCommission += commissionValue;

      if (order.status === 'completed') {
        acc.paidSales += Number(order.total_amount);
        acc.confirmedCommission += commissionValue;
      } else {
        acc.pendingCommission += commissionValue;
      }

      return acc;
    },
    {
      totalSales: 0,
      totalCommission: 0,
      confirmedCommission: 0,
      pendingCommission: 0,
      paidSales: 0,
    },
  );

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-zinc-900">Relatório de Comissões</h1>
          <p className="text-zinc-500 mt-1">Gestão inteligente de remuneração de vendedores</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" /> Exportar PDF
        </button>
      </div>

      <ErrorMessage message={error || ''} />

      {/* Cards de Métricas Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Vendas Totais"
          value={formatCurrency(stats.totalSales)}
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          description="Volume bruto no período"
          gradient="from-blue-50 to-white"
        />
        <MetricCard
          title="Total Comissões"
          value={formatCurrency(stats.totalCommission)}
          icon={<DollarSign className="h-5 w-5 text-(--lumilee-gold)" />}
          description={`Média ${((stats.totalCommission / stats.totalSales) * 100 || 0).toFixed(1)}% de taxa`}
          gradient="from-orange-50 to-white"
        />
        <MetricCard
          title="A Confirmar"
          value={formatCurrency(stats.pendingCommission)}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          description="Vendas pendentes/em aberto"
          gradient="from-amber-50 to-white"
        />
        <MetricCard
          title="Pronto p/ Pagar"
          value={formatCurrency(stats.confirmedCommission)}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          description="Baseado em vendas concluídas"
          gradient="from-emerald-50 to-white"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-zinc-900 font-medium mb-2">
          <Filter className="h-4 w-4" /> Filtros Analíticos
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Vendedor
            </label>
            <select
              value={selectedSellerId}
              onChange={(e) => setSelectedSellerId(e.target.value)}
              className="w-full bg-zinc-50 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all"
            >
              <option value="all">Todos os Vendedores</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id.toString()}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Início
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full bg-zinc-50 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Fim</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full bg-zinc-50 border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Detalhes */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
          <h2 className="font-serif text-xl">Detalhamento de Vendas</h2>
          <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full font-mono">
            {filteredOrders.length} transações
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">ID Venda</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Valor Venda</th>
                <th className="px-6 py-4">% Comis.</th>
                <th className="px-6 py-4 text-right">Comissão</th>
                <th className="px-6 py-4 text-center">Status Venda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const seller = sellers.find((s) => s.id === order.seller_id);
                  const rate = seller?.commission_rate ?? 20;
                  const value = (order.total_amount * rate) / 100;

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-zinc-500">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-zinc-400">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                            {seller?.name.substring(0, 2)}
                          </div>
                          <span className="text-sm font-medium text-zinc-700">
                            {seller?.name || 'Administrador'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900 font-medium">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">{rate}%</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-(--lumilee-gold)">
                        {formatCurrency(value)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                            order.status === 'paid' || order.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700',
                          )}
                        >
                          {order.status === 'paid' || order.status === 'completed'
                            ? 'Paga'
                            : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 italic">
                    Nenhuma venda encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  description,
  gradient,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  gradient: string;
}) {
  return (
    <div
      className={cn(
        'bg-linear-to-br p-6 rounded-2xl border border-zinc-100 shadow-sm group hover:shadow-md transition-all',
        gradient,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-serif text-zinc-900">{value}</p>
        <p className="text-[10px] text-zinc-400 font-medium mt-1">{description}</p>
      </div>
    </div>
  );
}
