'use client';

import { Card } from '@/components/ui/card';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold mb-2">Lista de Desejos</h1>
        <p className="text-medium-gray text-sm">Seus itens favoritos salvos para depois.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock Item */}
        <Card className="group overflow-hidden border border-light-gray relative">
          <div className="aspect-square bg-gray-100 relative">
            {/* Image placeholder */}
            <div className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm cursor-pointer hover:text-red-500 text-red-500">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-playfair font-bold text-lg text-deep-black">
              Brinco Gota Esmeralda
            </h3>
            <p className="text-sm text-primary-gold font-bold mt-1">R$ 4.590,00</p>

            <button className="w-full mt-4 flex items-center justify-center gap-2 bg-deep-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-gold transition-colors">
              <ShoppingBag className="w-4 h-4" />
              Eu Quero
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
