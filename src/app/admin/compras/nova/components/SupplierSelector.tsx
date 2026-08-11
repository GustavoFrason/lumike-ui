import { User } from 'lucide-react';
import { Supplier } from '@/lib/services/suppliers.service';

interface SupplierSelectorProps {
  suppliers: Supplier[];
  selectedSupplierId: number | '';
  onSelectSupplier: (id: number | '') => void;
}

export function SupplierSelector({
  suppliers,
  selectedSupplierId,
  onSelectSupplier,
}: SupplierSelectorProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
      <label className="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
        <User className="h-4 w-4 text-(--lumike-gold)" />
        Fornecedor
      </label>
      <select
        value={selectedSupplierId}
        onChange={(e) => onSelectSupplier(e.target.value ? Number(e.target.value) : '')}
        className="w-full border rounded-lg px-4 py-2.5 bg-zinc-50 focus:ring-2 focus:ring-(--lumike-gold) outline-none"
        required
      >
        <option value="">Selecione um fornecedor...</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
