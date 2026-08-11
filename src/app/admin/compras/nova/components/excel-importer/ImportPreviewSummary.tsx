import { formatCurrency } from '@/lib/formatters';
import { ImportPreviewResponse } from './types';

interface ImportPreviewSummaryProps {
  preview: ImportPreviewResponse;
}

export function ImportPreviewSummary({ preview }: ImportPreviewSummaryProps) {
  const totalValue = [...preview.novos, ...preview.atualizacoes].reduce(
    (acc, r) => acc + r.unit_cost * r.quantity,
    0,
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
        <p className="text-[10px] font-bold text-blue-600 uppercase">Novos Produtos</p>
        <p className="text-lg font-bold text-blue-700 font-serif">{preview.novos.length}</p>
      </div>
      <div className="p-3 bg-green-50/50 rounded-xl border border-green-100 text-center">
        <p className="text-[10px] font-bold text-green-600 uppercase">Entrada de Estoque</p>
        <p className="text-lg font-bold text-green-700 font-serif">{preview.atualizacoes.length}</p>
      </div>
      <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-200 text-center">
        <p className="text-[10px] font-bold text-zinc-500 uppercase">Não-Catalogáveis</p>
        <p className="text-lg font-bold text-zinc-700 font-serif">
          {preview.naoCatalogaveis.length}
        </p>
      </div>
      <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-center">
        <p className="text-[10px] font-bold text-red-500 uppercase">Com Erro</p>
        <p className="text-lg font-bold text-red-600 font-serif">{preview.erros.length}</p>
      </div>
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center col-span-2 sm:col-span-1">
        <p className="text-[10px] font-bold text-amber-600 uppercase">Valor Total</p>
        <p className="text-lg font-bold text-zinc-900 font-serif">{formatCurrency(totalValue)}</p>
      </div>
    </div>
  );
}
