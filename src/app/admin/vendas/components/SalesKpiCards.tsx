import { formatCurrency } from '@/lib/formatters';

interface SalesKpiCardsProps {
  total: number;
  ticketMedio: number;
  pendente: number;
}

export function SalesKpiCards({ total, ticketMedio, pendente }: SalesKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
          Vendas (Filtrado)
        </p>
        <p className="text-2xl font-bold text-zinc-900">{formatCurrency(total)}</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
          Ticket Médio
        </p>
        <p className="text-2xl font-bold text-(--lumilee-gold)">{formatCurrency(ticketMedio)}</p>
      </div>
      <div className="p-4 rounded-xl border border-red-100 shadow-sm bg-red-50/30">
        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
          Pendente a Receber
        </p>
        <p className="text-2xl font-bold text-red-600 font-mono">{formatCurrency(pendente)}</p>
      </div>
    </div>
  );
}
