import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#D4AF37', '#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B'];

interface RoiProfitPieChartProps {
  pieData: { name: string; value: number }[];
  totalProfit: number;
}

export function RoiProfitPieChart({ pieData, totalProfit }: RoiProfitPieChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
      <h3 className="font-playfair font-bold text-zinc-900 mb-8 border-b pb-4 text-lg">
        Composição do Lucro
      </h3>
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">Top 5</p>
            <p className="text-sm font-bold text-zinc-900 leading-tight">Partners</p>
          </div>
        </div>

        <div className="space-y-3 px-2">
          {pieData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-xs font-semibold text-zinc-600 truncate max-w-[140px]">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-900">
                {((item.value / totalProfit) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
