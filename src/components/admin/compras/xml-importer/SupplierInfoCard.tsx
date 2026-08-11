import { Package } from 'lucide-react';
import { Supplier } from '@/lib/services/suppliers.service';

interface SupplierInfoCardProps {
  supplierInfo: { cnpj: string; name: string; matchedSupplier?: Supplier } | null;
}

export function SupplierInfoCard({ supplierInfo }: SupplierInfoCardProps) {
  return (
    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Fornecedor Identificado</p>
          <p className="font-bold text-zinc-900">{supplierInfo?.name}</p>
          <p className="text-xs text-zinc-500 font-mono">{supplierInfo?.cnpj}</p>
        </div>
      </div>
      {!supplierInfo?.matchedSupplier ? (
        <div className="text-right">
          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">
            Não Cadastrado
          </span>
          <p className="text-xs text-zinc-400 mt-1">Vincule manualmente ou ignore</p>
        </div>
      ) : (
        <div className="text-right">
          <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">
            Cadastrado
          </span>
          <p className="text-xs text-green-700 font-bold mt-1">ID #{supplierInfo.matchedSupplier.id}</p>
        </div>
      )}
    </div>
  );
}
