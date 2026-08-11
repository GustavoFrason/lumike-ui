import { ShoppingBag, Wallet, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface CustomerKpiCardsProps {
  totalSpent: number;
  currentDebt: number;
  averageTicket: number;
  lastOrderDate: string;
}

export function CustomerKpiCards({
  totalSpent,
  currentDebt,
  averageTicket,
  lastOrderDate,
}: CustomerKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100">
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <ShoppingBag className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">LTV Total</span>
        </div>
        <p className="text-xl font-bold text-(--lumike-taupe-dark) font-serif">
          {formatCurrency(totalSpent)}
        </p>
      </div>

      <div
        className={`p-4 rounded-xl shadow-sm border transition-all ${currentDebt > 0 ? 'bg-red-50/50 border-red-100' : 'bg-white border-zinc-100'}`}
      >
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Wallet className={`h-4 w-4 ${currentDebt > 0 ? 'text-red-500' : ''}`} />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${currentDebt > 0 ? 'text-red-400' : ''}`}
          >
            Dívida Atual
          </span>
        </div>
        <p
          className={`text-xl font-bold font-serif ${currentDebt > 0 ? 'text-red-600' : 'text-green-600'}`}
        >
          {formatCurrency(currentDebt)}
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100">
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Calendar className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Ticket Médio</span>
        </div>
        <p className="text-xl font-bold text-zinc-700 font-serif">
          {formatCurrency(averageTicket)}
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100">
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Calendar className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Último Pedido</span>
        </div>
        <p className="text-xl font-bold text-zinc-700 font-serif">{lastOrderDate}</p>
      </div>
    </div>
  );
}
