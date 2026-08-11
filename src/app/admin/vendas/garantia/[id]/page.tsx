'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ordersService, Order } from '@/lib/services/orders.service';
import { formatDate } from '@/lib/formatters';

export default function WarrantyPage() {
  const params = useParams();
  const id = Number(params.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    ordersService
      .getById(id)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !order) return <div className="text-center p-8">Carregando...</div>;

  const expirationDate = new Date(order.created_at);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  return (
    <div className="max-w-[148mm] mx-auto p-12 bg-white text-zinc-900 font-sans border-12 border-double border-(--lumike-gold) print:max-w-none print:w-full print:border-12 shadow-2xl relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-(--lumike-gold)/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>

      {/* Header */}
      <div className="text-center mb-10 relative">
        <h1 className="text-4xl font-playfair font-black tracking-[0.3em] text-zinc-900 mb-2">
          LUMIKE
        </h1>
        <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-400 mb-8 font-medium">
          Semijoias & Acessórios de Luxo
        </p>

        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-12 bg-(--lumike-gold)"></div>
          <h2 className="text-xl font-playfair italic font-medium text-zinc-700">
            Certificado de Garantia
          </h2>
          <div className="h-px w-12 bg-(--lumike-gold)"></div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 text-center max-w-lg mx-auto">
        <p className="text-sm text-zinc-600 leading-relaxed">
          Certificamos que as joias deste pedido foram produzidas sob rigoroso controle de
          qualidade, utilizando materiais nobres e acabamento de alta joalheria.
        </p>

        <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100 text-left space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Detalhes da Aquisição
            </span>
            <span className="text-xs font-serif italic text-(--lumike-gold)">
              Pedido #{order.id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[9px] text-zinc-400 uppercase tracking-tighter">Proprietário(a)</p>
              <p className="font-bold text-zinc-800">
                {order.customers?.name || 'Consumidor Final'}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[9px] text-zinc-400 uppercase tracking-tighter">Data de Emissão</p>
              <p className="font-bold text-zinc-800">{formatDate(order.created_at)}</p>
            </div>
            <div className="space-y-1 col-span-2 pt-2 border-t border-zinc-100">
              <p className="text-[9px] text-zinc-400 uppercase tracking-tighter mb-2">
                Itens com Cobertura
              </p>
              <div className="flex flex-wrap gap-2">
                {order.items?.map((item, i) => (
                  <span
                    key={i}
                    className="bg-white border border-zinc-200 px-2 py-1 rounded text-[10px] text-zinc-600 font-medium"
                  >
                    {item.products?.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 space-y-4 text-justify px-4">
          <p className="font-bold text-center text-zinc-400 uppercase tracking-[0.2em] mb-4">
            Termos e Condições
          </p>
          <div className="grid grid-cols-1 gap-3">
            <p className="flex gap-2">
              <span className="font-bold text-(--lumike-gold)">1.</span>
              <span>
                Esta garantia assegura o banho de ouro 18k e ródio por um período de{' '}
                <strong>1 (um) ano</strong> a partir da data de compra.
              </span>
            </p>
            <p className="flex gap-2">
              <span className="font-bold text-(--lumike-gold)">2.</span>
              <span>
                Cobertura exclusiva para defeitos técnicos de fabricação e desprendimento do metal.
                Reclamações serão avaliadas pelo nosso laboratório.
              </span>
            </p>
            <p className="flex gap-2">
              <span className="font-bold text-(--lumike-gold)">3.</span>
              <span>
                A garantia <strong>não cobre</strong> danos por mau uso, quebras, quedas de pedras,
                riscos ou contato com agentes químicos (perfumes, cremes, mar e piscina).
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-56 h-px bg-zinc-200 mb-2"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-800">
            Autenticidade Lumike
          </p>
          <p className="text-[9px] text-zinc-400 mt-1 italic">
            Válido até {formatDate(expirationDate.toISOString())}
          </p>
        </div>

        <div className="pt-8 opacity-40 grayscale flex justify-center gap-12 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <span>Exclusive Design</span>
          <span>Premium Quality</span>
        </div>
      </div>

      {/* Print Button (Hide on Print) */}
      <button
        onClick={() => window.print()}
        className="mt-12 w-full bg-zinc-900 text-white py-4 rounded-xl font-bold tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 print:hidden"
      >
        IMPRIMIR CERTIFICADO
      </button>
    </div>
  );
}
