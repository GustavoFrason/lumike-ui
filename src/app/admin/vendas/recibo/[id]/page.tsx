'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ordersService, Order } from '@/lib/services/orders.service';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { ShieldCheck } from 'lucide-react';

export default function ReceiptPage() {
  // Recebemos a Order completa para evitar novo fetch, mas como é nova pág, precisamos buscar.
  const params = useParams();
  const id = Number(params.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ordersService.getById(id);
      setOrder(data);
      // Agenda impressão automática após renderizar
      setTimeout(() => {
        window.print();
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar pedido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadOrder();
  }, [id, loadOrder]);

  if (loading) return <div className="text-center p-8">Carregando recibo...</div>;
  if (error || !order)
    return <div className="text-red-600 p-8">{error || 'Pedido não encontrado'}</div>;

  return (
    <div className="max-w-[80mm] mx-auto p-6 bg-white text-zinc-900 font-sans text-sm leading-relaxed print:max-w-none print:w-full print:p-0">
      {/* Header */}
      <div className="text-center mb-6 pb-6 border-b-2 border-double border-zinc-200">
        <h1 className="text-3xl font-playfair font-black tracking-widest text-zinc-900 mb-1">
          LUMILEE
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
          Semijoias & Acessórios
        </p>
        <div className="mt-4 space-y-0.5 text-[10px] text-zinc-400">
          <p>CNPJ: 00.000.000/0001-00</p>
          <p>Rua Exemplo, 123 - São Paulo/SP</p>
          <p>Tel: (11) 99999-9999</p>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <span className="bg-zinc-900 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-1">
            RECIBO DE VENDA
          </span>
          <p className="text-xs font-serif italic text-zinc-500">Nº {order.id}</p>
          <p className="text-[10px] text-zinc-400">{formatDate(order.created_at)}</p>
        </div>
      </div>

      {/* Customer */}
      <div className="mb-6 space-y-1">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cliente</p>
        <p className="text-sm font-semibold text-zinc-800">
          {order.customers?.name || 'Consumidor Final'}
        </p>
        {order.customers?.phone && <p className="text-xs text-zinc-500">{order.customers.phone}</p>}
      </div>

      {/* Items */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
          Itens do Pedido
        </p>
        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div key={index} className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold text-zinc-800 leading-tight">{item.products?.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {item.quantity} un. × {formatCurrency(item.unit_price)}
                </p>
              </div>
              <p className="font-bold text-zinc-900 text-right">
                {formatCurrency(item.quantity * item.unit_price)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mb-10 pt-4 border-t border-zinc-100 flex flex-col items-end">
        <div className="flex justify-between w-full text-zinc-500 text-xs mb-1">
          <span>Subtotal</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
        <div className="flex justify-between w-full items-baseline">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total</span>
          <span className="text-2xl font-black text-zinc-900">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
        <p className="text-[10px] text-zinc-400 italic mt-2">
          Pagamento: {order.payment_method?.toUpperCase()}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-zinc-100"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-zinc-300">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-serif italic text-zinc-800">Obrigado pela preferência!</p>
          <div className="text-[10px] text-zinc-400 leading-relaxed max-w-[200px] mx-auto">
            <p>Nossas peças possuem garantia de 6 meses no banho.</p>
            <p className="mt-1 font-bold text-zinc-500">
              Trocas somente com etiqueta e este cupom em até 7 dias.
            </p>
          </div>
        </div>

        <div className="pt-4">
          {/* Domínio e Instagram antigos mantidos de propósito — a marca
              virou Lumilee, mas o domínio/@ novos ainda não existem. */}
          <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-900">WWW.LUMIKE.COM.BR</p>
          <p className="text-[9px] text-zinc-400 mt-1">@lumike_acessorios</p>
        </div>
      </div>

      {/* Print Button (Hide on Print) */}
      <button
        onClick={() => window.print()}
        className="mt-12 w-full bg-zinc-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-zinc-200 transition-all hover:bg-zinc-800 active:scale-[0.98] print:hidden"
      >
        Imprimir Recibo
      </button>
    </div>
  );
}
