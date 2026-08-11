import { User, Package } from 'lucide-react';
import { WarrantyOrigin } from '@/lib/services/warranties.service';

interface OriginToggleProps {
  origin: WarrantyOrigin | undefined;
  onChange: (origin: WarrantyOrigin) => void;
}

export function OriginToggle({ origin, onChange }: OriginToggleProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Origem do Concerto</label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-all ${origin === 'sold' ? 'bg-primary-gold text-white border-primary-gold shadow-md' : 'bg-white text-zinc-600 hover:border-zinc-300'}`}
          onClick={() => onChange('sold')}
        >
          <User className="h-4 w-4" />
          <span className="font-medium text-sm">Venda (Cliente)</span>
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-all ${origin === 'stock' ? 'bg-primary-gold text-white border-primary-gold shadow-md' : 'bg-white text-zinc-600 hover:border-zinc-300'}`}
          onClick={() => onChange('stock')}
        >
          <Package className="h-4 w-4" />
          <span className="font-medium text-sm">Estoque Próprio</span>
        </button>
      </div>
    </div>
  );
}
