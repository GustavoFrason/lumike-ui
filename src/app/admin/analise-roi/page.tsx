'use client';

import { useState, useEffect } from 'react';
import { suppliersService, ROIAnalysis } from '@/lib/services/suppliers.service';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { DataTable } from '@/components/ui/data-table';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, PieChart, ShoppingBag } from 'lucide-react';

export default function AnaliseROIPage() {
  const [data, setData] = useState<ROIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadROI() {
      try {
        const roiData = await suppliersService.getROIAnalysis();
        setData(roiData || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao carregar análise de ROI');
      } finally {
        setLoading(false);
      }
    }
    loadROI();
  }, []);

  const totalCost = data.reduce((sum, item) => sum + item.total_cost, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.total_revenue, 0);
  const averageROI = totalCost > 0 ? (totalRevenue - totalCost) / totalCost : 0;

  if (loading)
    return <Loading size="lg" text="Calculando ROI por fornecedor..." className="py-12" />;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Análise de ROI por Fornecedor</h1>
        <p className="text-sm text-zinc-500">
          Acompanhe a lucratividade de cada parceiro comercial.
        </p>
      </div>

      <ErrorMessage message={error || ''} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-lg text-red-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Custo Total (Compras)
              </p>
              <p className="text-2xl font-bold text-zinc-900">{formatCurrency(totalCost)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-lg text-green-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Receita Total (Vendas)
              </p>
              <p className="text-2xl font-bold text-zinc-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-(--lumike-gold)/10 p-3 rounded-lg text-(--lumike-gold)">
              <PieChart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                ROI Médio
              </p>
              <p className="text-2xl font-bold text-zinc-900">{(averageROI * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-zinc-50">
          <h3 className="font-semibold text-zinc-800">Desempenho por Fornecedor</h3>
        </div>
        <DataTable
          data={data}
          columns={[
            {
              key: 'supplier_name',
              header: 'Fornecedor',
              render: (item) => (
                <span className="font-semibold text-zinc-900">{item.supplier_name}</span>
              ),
            },
            {
              key: 'total_cost',
              header: 'Custo Total',
              render: (item) => (
                <span className="text-zinc-600">{formatCurrency(item.total_cost)}</span>
              ),
            },
            {
              key: 'total_revenue',
              header: 'Receita Total',
              render: (item) => (
                <span className="text-zinc-600">{formatCurrency(item.total_revenue)}</span>
              ),
            },
            {
              key: 'roi',
              header: 'Lucro (ROI)',
              render: (item) => (
                <span className={`font-bold ${item.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(item.roi)}
                </span>
              ),
            },
            {
              key: 'roi_percentage',
              header: '% ROI',
              render: (item) => (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden min-w-[80px]">
                    <div
                      className={`h-full ${item.roi_percentage >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.max(item.roi_percentage / 5, 0), 100)}%` }} // Scaled visual for ROI (e.g. 500% = 100% bar)
                    />
                  </div>
                  <span
                    className={`text-xs font-bold ${item.roi_percentage >= 0 ? 'text-green-600' : 'text-red-600'} min-w-[50px] text-right`}
                  >
                    {item.roi_percentage.toFixed(1)}%
                  </span>
                </div>
              ),
            },
          ]}
          emptyTitle="Nenhuma análise disponível"
          emptyDescription="Os dados aparecerão aqui após registrar compras e realizar vendas de produtos vinculados aos fornecedores."
        />
      </div>
    </section>
  );
}
