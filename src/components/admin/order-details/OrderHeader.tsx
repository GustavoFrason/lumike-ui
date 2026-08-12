import { X, Calendar, MessageCircle } from 'lucide-react';
import { Order } from '@/lib/services/orders.service';
import { formatDate } from '@/lib/formatters';
import { StatusBadge } from '@/components/ui/status-badge';

interface OrderHeaderProps {
  order: Order;
  statusLabels: Record<string, string>;
  statusColors: Record<string, 'pending' | 'active' | 'completed' | 'cancelled'>;
  onClose: () => void;
}

export function OrderHeader({ order, statusLabels, statusColors, onClose }: OrderHeaderProps) {
  function handleShareWhatsapp() {
    const text = `Olá ${order.customers?.name}, segue o link do seu recibo da LUMILEE: ${window.location.origin}/admin/vendas/recibo/${order.id}`;
    window.open(
      `https://wa.me/${order.customers?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`,
      '_blank',
    );
  }

  return (
    <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-[var(--lumilee-beige)]">
      <div>
        <h2 className="text-2xl font-playfair font-bold text-zinc-900">Pedido #{order.id}</h2>
        <div className="flex items-center gap-2 mt-1">
          <StatusBadge
            status={statusColors[order.status] || 'pending'}
            label={statusLabels[order.status] || order.status}
          />
          <span className="text-sm text-zinc-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {formatDate(order.created_at)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleShareWhatsapp}
          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition"
          title="Compartilhar Recibo no WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-zinc-600 transition hover:bg-white rounded-full"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
