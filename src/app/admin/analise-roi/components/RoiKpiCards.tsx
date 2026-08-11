import { SVGProps } from 'react';
import { TrendingUp, PieChart as PieChartIcon, ShoppingBag, Award, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { ROIAnalysis } from '@/lib/services/suppliers.service';

interface RoiKpiCardsProps {
  totalInvested: number;
  totalRevenue: number;
  totalProfit: number;
  averageROI: number;
  bestSupplier: ROIAnalysis | undefined;
}

export function RoiKpiCards({
  totalInvested,
  totalRevenue,
  totalProfit,
  averageROI,
  bestSupplier,
}: RoiKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Investimento Total</p>
        <p className="text-2xl font-bold text-zinc-900 font-serif">{formatCurrency(totalInvested)}</p>
        <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase truncate">
          <InfoIcon className="h-3 w-3" /> Baseado em NF-e de entrada
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-green-500">
          <TrendingUp className="h-12 w-12" />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Receita Gerada</p>
        <p className="text-2xl font-bold text-zinc-900 font-serif">{formatCurrency(totalRevenue)}</p>
        <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
          Lucro: {formatCurrency(totalProfit)}
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl relative overflow-hidden group border border-zinc-800">
        <div className="absolute -bottom-2 -right-2 opacity-20 text-(--lumike-gold)">
          <PieChartIcon className="h-20 w-20" />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">ROI Global Médio</p>
        <p className="text-3xl font-bold text-white font-serif">{averageROI.toFixed(1)}%</p>
        <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 text-[10px] font-bold uppercase">
          <ArrowUpRight className="h-3 w-3" /> Performance Positiva
        </div>
      </div>

      {bestSupplier && (
        <div className="bg-white p-6 rounded-2xl border-2 border-(--lumike-gold)/20 shadow-lg shadow-orange-50/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-(--lumike-gold)/20">
            <Award className="h-12 w-12" />
          </div>
          <p className="text-[10px] font-bold text-(--lumike-gold) uppercase tracking-[0.2em] mb-1">
            Top Performance
          </p>
          <p className="text-xl font-bold text-zinc-900 truncate pr-8">{bestSupplier.supplier_name}</p>
          <p className="text-sm font-bold text-zinc-500 mt-1">ROI {bestSupplier.roi}%</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Liderança em Margem</span>
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-6 rounded-full bg-zinc-200 border-2 border-white" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
