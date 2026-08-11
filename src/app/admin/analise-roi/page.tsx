'use client';

import { useState, useEffect } from 'react';
import { suppliersService, ROIAnalysis } from '@/lib/services/suppliers.service';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { DataTable } from '@/components/ui/data-table';
import { getErrorMessage } from '@/lib/utils';
import { Target } from 'lucide-react';
import { RoiKpiCards } from './components/RoiKpiCards';
import { RoiPerformanceChart } from './components/RoiPerformanceChart';
import { RoiProfitPieChart } from './components/RoiProfitPieChart';
import { roiColumns } from './components/roi-columns';

export default function AnaliseROIPage() {
  const [data, setData] = useState<ROIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadROI() {
      try {
        const roiData = await suppliersService.getROIAnalysis();
        setData(roiData || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Erro ao carregar análise de ROI'));
      } finally {
        setLoading(false);
      }
    }
    loadROI();
  }, []);

  const totalInvested = data.reduce((sum, item) => sum + item.total_invested, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.total_revenue, 0);
  const totalProfit = totalRevenue - totalInvested;
  const averageROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  // Best Supplier
  const bestSupplier = [...data].sort((a, b) => b.roi - a.roi)[0];

  const chartData = data
    .map((item) => ({
      name: item.supplier_name,
      Investido: item.total_invested,
      Retorno: item.total_revenue,
      Lucro: item.gross_profit,
      ROI: item.roi,
    }))
    .slice(0, 8); // Top 8 for visual clarity

  const pieData = data
    .filter((i) => i.gross_profit > 0)
    .map((item) => ({
      name: item.supplier_name,
      value: item.gross_profit,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (loading)
    return <Loading size="lg" text="Cruzando dados de compras e vendas..." className="py-24" />;

  return (
    <section className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-zinc-900">Inteligência de ROI</h1>
          <p className="text-zinc-500 font-medium">
            Análise de performance financeira por parceiro comercial.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full border border-zinc-200">
          <Target className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
            Até o momento (Lifetime)
          </span>
        </div>
      </div>

      <ErrorMessage message={error || ''} />

      <RoiKpiCards
        totalInvested={totalInvested}
        totalRevenue={totalRevenue}
        totalProfit={totalProfit}
        averageROI={averageROI}
        bestSupplier={bestSupplier}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RoiPerformanceChart chartData={chartData} />
        <RoiProfitPieChart pieData={pieData} totalProfit={totalProfit} />
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden border-b-0">
        <div className="px-6 py-5 border-b bg-zinc-50 flex items-center justify-between">
          <h3 className="font-playfair font-bold text-zinc-800 text-lg">Extrato Analítico</h3>
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
            {data.length} Parceiros
          </span>
        </div>
        <DataTable
          data={data}
          columns={roiColumns}
          emptyTitle="Nenhuma análise disponível"
          emptyDescription="Os dados aparecerão aqui após registrar compras e realizar vendas de produtos vinculados aos fornecedores."
        />
      </div>
    </section>
  );
}
