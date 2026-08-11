import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RoiChartDatum {
  name: string;
  Investido: number;
  Retorno: number;
  Lucro: number;
  ROI: number;
}

interface RoiPerformanceChartProps {
  chartData: RoiChartDatum[];
}

export function RoiPerformanceChart({ chartData }: RoiPerformanceChartProps) {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-playfair font-bold text-zinc-900 flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-(--lumike-gold)" />
          Comparativo de Desempenho
        </h3>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-200" /> Investido
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-(--lumike-gold)" /> Retorno
          </span>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: '#A1A1AA' }}
              dy={10}
            />
            <YAxis axisLine={false} tickLine={false} tick={false} />
            <Tooltip
              cursor={{ fill: '#F8FAFC' }}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar dataKey="Investido" fill="#E4E4E7" radius={[4, 4, 0, 0]} barSize={32} />
            <Bar
              dataKey="Retorno"
              fill="#D4AF37"
              radius={[4, 4, 0, 0]}
              barSize={32}
              animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
