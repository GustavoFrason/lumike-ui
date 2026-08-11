import { Search, User } from 'lucide-react';
import { Customer } from '@/lib/services/customers.service';
import { Order } from '@/lib/services/orders.service';

interface CustomerOrderSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  selectedCustomerId: number | null;
  customerLocked: boolean;

  orders: Order[];
  selectedOrderId: number | null;
  onSelectOrder: (id: number) => void;
  orderLocked: boolean;
}

export function CustomerOrderSection({
  search,
  onSearchChange,
  customers,
  onSelectCustomer,
  selectedCustomerId,
  customerLocked,
  orders,
  selectedOrderId,
  onSelectOrder,
  orderLocked,
}: CustomerOrderSectionProps) {
  return (
    <div className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
        <User className="h-3 w-3" /> Dados da Cliente
      </h3>

      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-700">Buscar Cliente</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Nome, CPF ou WhatsApp..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-gold"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={customerLocked}
          />
        </div>
        {customers.length > 0 && !selectedCustomerId && (
          <div className="absolute z-20 w-64 bg-white border rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
            {customers.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-sm border-b last:border-0"
                onClick={() => onSelectCustomer(c)}
              >
                <span className="font-medium">{c.name}</span>
                <span className="block text-[10px] text-zinc-400">{c.phone || c.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-700">Pedido Origem (Opcional)</label>
        <select
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-gold bg-white"
          value={selectedOrderId || ''}
          onChange={(e) => onSelectOrder(Number(e.target.value))}
          disabled={!selectedCustomerId || orderLocked}
        >
          <option value="">Selecione o pedido...</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              Pedido #{o.id} - {new Date(o.created_at).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
