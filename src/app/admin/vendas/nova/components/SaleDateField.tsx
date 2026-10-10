import { CalendarClock } from 'lucide-react';

/**
 * Início do fluxo de caixa no sistema — venda com data passada não pode
 * ser anterior (mesma regra da API: CASH_FLOW_START_DATE).
 */
export const SALE_DATE_MIN = '2026-01-10';

interface SaleDateFieldProps {
  value: string;
  /** Hoje (São Paulo), 'YYYY-MM-DD' — teto do campo. */
  today: string;
  onChange: (value: string) => void;
}

/**
 * Data da venda — só para a gestão lançar depois uma venda já feita.
 * Padrão: hoje.
 */
export function SaleDateField({ value, today, onChange }: SaleDateFieldProps) {
  const isPast = value !== '' && value < today;

  return (
    <div className="mb-6">
      <label
        htmlFor="sale-date"
        className="text-xs font-semibold uppercase text-zinc-500 mb-1.5 flex items-center gap-1"
      >
        <CalendarClock className="h-3 w-3" /> Data da Venda
      </label>
      <input
        id="sale-date"
        type="date"
        value={value}
        min={SALE_DATE_MIN}
        max={today}
        onChange={(e) => onChange(e.target.value || today)}
        className="w-full border rounded-lg p-2.5 text-sm bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-(--lumilee-gold) focus:border-transparent outline-none"
      />
      {isPast && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 mt-1.5">
          Venda com data passada: entra no caixa e nos relatórios nessa data. O estoque é baixado
          agora.
        </p>
      )}
    </div>
  );
}
