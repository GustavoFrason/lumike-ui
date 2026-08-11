import { SVGProps } from 'react';
import { CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { XmlItem } from './types';

interface ParsedItemsTableProps {
  parsedItems: XmlItem[];
}

export function ParsedItemsTable({ parsedItems }: ParsedItemsTableProps) {
  return (
    <>
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100/80 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-4 py-3 text-left">SKU & Nome (XML)</th>
              <th className="px-4 py-3 text-center">Qty / Custo</th>
              <th className="px-4 py-3 text-center">Status no Sistema</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {parsedItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-4 max-w-xs">
                  <p className="font-bold text-zinc-900 truncate">{item.name}</p>
                  <p className="text-xs font-mono text-zinc-400">cProd: {item.sku}</p>
                </td>
                <td className="px-4 py-4 text-center">
                  <p className="font-bold text-zinc-700">{item.quantity} un</p>
                  <p className="text-xs text-zinc-400">{formatCurrency(item.unit_cost)}</p>
                </td>
                <td className="px-4 py-4 text-center">
                  {item.status === 'matched' ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase">Mapeado</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase">Cadastrar Novo</span>
                    </div>
                  )}
                  {item.system_product && (
                    <p className="text-[10px] text-zinc-400 mt-1 truncate max-w-[120px] mx-auto">
                      {item.system_product.name}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="text-zinc-400 hover:text-(--lumike-gold) p-1 transition">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
        <Info className="h-5 w-5 text-blue-400 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed font-medium">
          Dica: O sistema usará o SKU da nota fiscal (`cProd`) para cruzar os dados. Se for um
          produto novo, será aberto um fluxo de cadastro rápido durante o processamento para
          garantir que todos os dados extra (fotos, categorias) sejam capturados corretamente.
        </p>
      </div>
    </>
  );
}

// Helper to provide the icon used in the table
function PlusCircle(props: SVGProps<SVGSVGElement>) {
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
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
