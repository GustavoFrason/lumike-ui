import { Column } from '@/components/ui/data-table';
import { formatCurrency } from '@/lib/formatters';
import { ROIAnalysis } from '@/lib/services/suppliers.service';

export const roiColumns: Column<ROIAnalysis>[] = [
  {
    key: 'supplier_name',
    header: 'Fornecedor',
    render: (item) => (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 font-bold border border-zinc-200">
          {item.supplier_name.charAt(0)}
        </div>
        <span className="font-bold text-zinc-900">{item.supplier_name}</span>
      </div>
    ),
  },
  {
    key: 'total_invested',
    header: 'Total Investido',
    render: (item) => (
      <span className="text-zinc-600 font-medium">{formatCurrency(item.total_invested)}</span>
    ),
  },
  {
    key: 'total_revenue',
    header: 'Receita Bruta',
    render: (item) => (
      <span className="text-zinc-600 font-medium">{formatCurrency(item.total_revenue)}</span>
    ),
  },
  {
    key: 'gross_profit',
    header: 'Lucro (Valor)',
    render: (item) => (
      <span className={`font-bold ${item.gross_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatCurrency(item.gross_profit)}
      </span>
    ),
  },
  {
    key: 'roi',
    header: 'Margem (ROI)',
    render: (item) => (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden min-w-[80px]">
          <div
            className={`h-full ${item.roi >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(Math.max(item.roi / 5, 0), 100)}%` }}
          />
        </div>
        <span
          className={`text-xs font-bold ${item.roi >= 0 ? 'text-green-600' : 'text-red-600'} min-w-[50px] text-right`}
        >
          {item.roi.toFixed(1)}%
        </span>
      </div>
    ),
  },
];
