'use client';

import { useEffect, useState } from 'react';
import { dashboardService, DashboardKPIs, TopSeller, LowStockAlert } from '@/lib/services/dashboard.service';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, Package, Users, AlertTriangle, CreditCard, Target, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [lowStock, setLowStock] = useState<LowStockAlert[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<{ date: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      const [kpisData, topSellersData, lowStockData, revenueData] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getTopSellers(5),
        dashboardService.getLowStockAlerts(5),
        dashboardService.getRevenueHistory(),
      ]);
      setKpis(kpisData);
      setTopSellers(topSellersData);
      setLowStock(lowStockData);
      setRevenueHistory(revenueData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dashboard';
      setError(message);
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <Loading size="lg" text="Carregando dashboard..." className="py-12" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bem-vindo ao Painel Lumike ✨</h1>
        <button
          onClick={loadDashboard}
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          Atualizar
        </button>
      </div>

      <ErrorMessage message={error || ''} />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg bg-[var(--lumike-beige)] border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Total de Vendas</h2>
            <TrendingUp className="h-5 w-5 text-[var(--lumike-gold)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--lumike-gold)]">
            {kpis ? formatCurrency(kpis.total_vendas) : 'R$ 0,00'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{kpis?.total_pedidos || 0} pedidos confirmados</p>
        </div>

        <div className="p-6 rounded-lg bg-[var(--lumike-beige)] border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Ticket Médio</h2>
            <CreditCard className="h-5 w-5 text-[var(--lumike-gold)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--lumike-gold)]">
            {kpis ? formatCurrency(kpis.ticket_medio) : 'R$ 0,00'}
          </p>
        </div>

        <div className="p-6 rounded-lg bg-[var(--lumike-beige)] border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Taxa de Conversão</h2>
            <Target className="h-5 w-5 text-[var(--lumike-gold)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--lumike-gold)]">
            {(kpis?.taxa_conversao ?? 0).toFixed(1)}%
          </p>
        </div>

        <div className="p-6 rounded-lg bg-white border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Marketing Leads</h2>
            <Zap className="h-5 w-5 text-[var(--lumike-gold)]" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">
            {kpis?.total_leads || 0}
          </p>
        </div>

        <div className="p-6 rounded-lg bg-white border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Produtos Ativos</h2>
            <Package className="h-5 w-5 text-[var(--lumike-gold)]" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">
            {kpis?.produtos_ativos || 0}
          </p>
        </div>

        <div className="p-6 rounded-lg bg-white border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Clientes Registrados</h2>
            <Users className="h-5 w-5 text-[var(--lumike-gold)]" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">
            {kpis?.clientes || 0}
          </p>
        </div>
      </div>

      {/* Gráfico de Faturamento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold mb-2">Histórico de Faturamento (30 dias)</h2>
        <p className="text-sm text-zinc-500 mb-4">Acompanhe o desempenho das suas vendas diárias</p>
        <RevenueChart data={revenueHistory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Produtos Mais Vendidos (90 dias)</h2>
          {topSellers.length > 0 ? (
            <div className="space-y-3">
              {topSellers.map((seller, index) => (
                <div
                  key={seller.product_id}
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-400 w-6">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{seller.name}</span>
                  </div>
                  <span className="text-sm text-zinc-600">
                    {seller.qty_90d} unidades
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Nenhuma venda nos últimos 90 dias</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Alertas de Estoque</h2>
            {lowStock.length > 0 && (
              <Link
                href="/admin/estoque"
                className="text-sm text-[var(--lumike-gold)] hover:underline"
              >
                Ver todos
              </Link>
            )}
          </div>
          {lowStock.length > 0 ? (
            <div className="space-y-3">
              {lowStock.map((alert) => (
                <div
                  key={alert.product_id}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-red-900">{alert.product_name}</p>
                    <p className="text-xs text-red-700">
                      Estoque: {alert.current_stock} | Mínimo: {alert.min_stock} | Faltam: {alert.missing}
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Nenhum alerta de estoque baixo</p>
          )}
        </div>
      </div>
    </section>
  );
}