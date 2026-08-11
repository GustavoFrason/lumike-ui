import { formatCurrency } from '@/lib/formatters';
import { XmlItem } from './types';

interface ImportSummaryCardsProps {
  parsedItems: XmlItem[];
}

export function ImportSummaryCards({ parsedItems }: ImportSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
        <p className="text-[10px] font-bold text-zinc-400 uppercase">Itens na Nota</p>
        <p className="text-lg font-bold text-zinc-900 font-serif">{parsedItems.length}</p>
      </div>
      <div className="p-3 bg-green-50/50 rounded-xl border border-green-100 text-center">
        <p className="text-[10px] font-bold text-green-600 uppercase">Reconhecidos</p>
        <p className="text-lg font-bold text-green-700 font-serif">
          {parsedItems.filter((i) => i.status === 'matched').length}
        </p>
      </div>
      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
        <p className="text-[10px] font-bold text-blue-600 uppercase">Novos Produtos</p>
        <p className="text-lg font-bold text-blue-700 font-serif">
          {parsedItems.filter((i) => i.status === 'new').length}
        </p>
      </div>
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
        <p className="text-[10px] font-bold text-amber-600 uppercase">Valor Total</p>
        <p className="text-lg font-bold text-zinc-900 font-serif">
          {formatCurrency(parsedItems.reduce((acc, i) => acc + i.unit_cost * i.quantity, 0))}
        </p>
      </div>
    </div>
  );
}
