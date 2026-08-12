import { Tag, Warehouse } from 'lucide-react';
import { CustomerSearch } from '@/components/sales/customer-search';
import { Customer } from '@/lib/services/customers.service';
import { User } from '@/lib/services/users.service';

interface CustomerSellerSectionProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  sellers: User[];
  selectedSellerId: number | null;
  onSelectSeller: (sellerId: number | null) => void;
  stockLocationUserId: number | null;
  onSelectStockLocation: (userId: number | null) => void;
}

export function CustomerSellerSection({
  selectedCustomer,
  onSelectCustomer,
  sellers,
  selectedSellerId,
  onSelectSeller,
  stockLocationUserId,
  onSelectStockLocation,
}: CustomerSellerSectionProps) {
  return (
    <div className="mb-6 border-b pb-4 space-y-4">
      <CustomerSearch onSelect={onSelectCustomer} selectedCustomer={selectedCustomer} />

      <div>
        <label className="text-xs font-semibold uppercase text-zinc-500 mb-1.5 flex items-center gap-1">
          <Tag className="h-3 w-3" /> Vendedor (Comissão)
        </label>
        <select
          value={selectedSellerId || ''}
          onChange={(e) => onSelectSeller(Number(e.target.value) || null)}
          className="w-full border rounded-lg p-2.5 text-sm bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-(--lumike-gold) focus:border-transparent transition-all outline-none"
        >
          <option value="">Nenhum vendedor</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              👤 {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase text-zinc-500 mb-1.5 flex items-center gap-1">
          <Warehouse className="h-3 w-3" /> Estoque de Origem
        </label>
        <select
          value={stockLocationUserId || ''}
          onChange={(e) => onSelectStockLocation(Number(e.target.value) || null)}
          className="w-full border rounded-lg p-2.5 text-sm bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-(--lumike-gold) focus:border-transparent transition-all outline-none"
        >
          <option value="">Estoque Lumike (Central)</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (Revendedor)
            </option>
          ))}
        </select>
        <p className="text-[11px] text-zinc-400 mt-1">
          De onde sai o produto — independente do vendedor da comissão acima. Só troque se o
          revendedor realmente carrega este produto com ele.
        </p>
      </div>
    </div>
  );
}
