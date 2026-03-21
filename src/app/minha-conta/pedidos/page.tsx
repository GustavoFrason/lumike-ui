'use client';

import { Card } from '@/components/ui/card';
import { Package, Truck, CheckCircle } from 'lucide-react';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold mb-2">Meus Pedidos</h1>
        <p className="text-medium-gray text-sm">Acompanhe o status das suas compras recentes.</p>
      </div>

      <div className="space-y-6">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-medium-gray" />
          </div>
          <h3 className="font-playfair text-xl font-bold text-deep-black">Nenhum pedido recente</h3>
          <p className="text-medium-gray text-sm mt-2 max-w-xs mx-auto">
            Você ainda não realizou nenhuma compra conosco. Que tal explorar nossa nova coleção?
          </p>
          <a
            href="/"
            className="mt-6 px-8 py-3 bg-deep-black text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-gold transition-colors"
          >
            Ir para a Loja
          </a>
        </div>
      </div>
    </div>
  );
}
