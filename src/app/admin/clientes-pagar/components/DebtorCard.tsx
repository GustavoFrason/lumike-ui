import { ChevronDown, ChevronUp, DollarSign, Phone, MessageCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { generateWhatsAppCollectionLink } from '@/lib/utils/whatsapp';
import { Debtor, OrderPayment } from '@/lib/services/accounts-receivable.service';
import { PaymentFormState } from './types';
import { DebtorOrderRow } from './DebtorOrderRow';

interface DebtorCardProps {
  debtor: Debtor;
  isExpanded: boolean;
  onToggleExpand: () => void;
  paymentState: PaymentFormState;
  paymentHistory: Record<number, OrderPayment[]>;
  loadingHistory: Record<number, boolean>;
}

export function DebtorCard({
  debtor,
  isExpanded,
  onToggleExpand,
  paymentState,
  paymentHistory,
  loadingHistory,
}: DebtorCardProps) {
  function handleCollectViaWhatsApp() {
    const whatsappUrl = generateWhatsAppCollectionLink({
      customerName: debtor.customer_name,
      customerPhone: debtor.customer_phone || '',
      amount: debtor.total_debt,
      orderDate: formatDate(debtor.orders[0]?.date || new Date().toISOString()),
      pixKey: 'sua-chave-pix@exemplo.com', // TODO: Add to settings
    });
    window.open(whatsappUrl, '_blank');
  }

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="bg-red-100 p-2 rounded-full text-red-600">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">{debtor.customer_name}</h3>
            <div className="flex gap-3 text-sm text-zinc-500">
              <span>{debtor.orders_count} compra(s) pendente(s)</span>
              {debtor.customer_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {debtor.customer_phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-red-600">{formatCurrency(debtor.total_debt)}</span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-zinc-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-zinc-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-zinc-100 bg-zinc-50 p-4 space-y-3 animate-in slide-in-from-top-2">
          {debtor.orders.map((order) => (
            <DebtorOrderRow
              key={order.id}
              order={order}
              paymentState={paymentState}
              history={paymentHistory[order.id]}
              loadingHistory={!!loadingHistory[order.id]}
            />
          ))}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCollectViaWhatsApp}
              disabled={!debtor.customer_phone}
              className="text-sm text-white bg-[#25D366] hover:bg-[#20BA5A] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={!debtor.customer_phone ? 'Cliente sem WhatsApp cadastrado' : 'Enviar cobrança via WhatsApp'}
            >
              <MessageCircle className="h-4 w-4" /> Cobrar via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
