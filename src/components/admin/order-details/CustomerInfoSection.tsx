import { User } from 'lucide-react';
import { Order } from '@/lib/services/orders.service';

interface CustomerInfoSectionProps {
  order: Order;
}

export function CustomerInfoSection({ order }: CustomerInfoSectionProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <User className="h-4 w-4 text-[var(--lumilee-gold)]" /> Dados do Cliente
      </h3>
      <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
        <p className="font-medium text-zinc-900">{order.customers?.name}</p>
        <p className="text-sm text-zinc-600">{order.customers?.email}</p>
        <p className="text-sm text-zinc-600 font-mono mt-1">{order.customers?.phone}</p>
      </div>
    </section>
  );
}
