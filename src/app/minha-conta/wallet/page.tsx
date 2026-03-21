'use client';

import { Card } from '@/components/ui/card';
import { Ticket, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

// Mock data for now
const COUPONS = [
  {
    code: 'BEMVINDO10',
    discount: '10%',
    description: 'Desconto de Boas-vindas',
    valid_until: 'Indeterminado',
    status: 'active',
  },
];

export default function WalletPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold mb-2">Carteira & Cupons</h1>
        <p className="text-medium-gray text-sm">Gerencie seus descontos e créditos exclusivos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COUPONS.map((coupon) => (
          <Card
            key={coupon.code}
            className="bg-white border border-light-gray overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-2">
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                Ativo
              </span>
            </div>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-gold/10 rounded-full flex items-center justify-center text-primary-gold mb-4">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-deep-black">
                {coupon.discount} OFF
              </h3>
              <p className="text-sm text-medium-gray mt-1">{coupon.description}</p>

              <div className="mt-6 w-full bg-off-white border-2 border-dashed border-gray-300 p-3 rounded flex items-center justify-between gap-4">
                <span className="font-mono font-bold text-lg text-deep-black tracking-widest">
                  {coupon.code}
                </span>
                <button
                  onClick={() => copyToClipboard(coupon.code)}
                  className="text-primary-gold hover:text-deep-black transition-colors"
                  title="Copiar código"
                >
                  {copied === coupon.code ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </Card>
        ))}

        {/* Empty State / No more coupons */}
        <Card className="bg-gray-50 border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center opacity-70">
          <p className="font-medium text-medium-gray">Você não possui outros cupons no momento.</p>
          <p className="text-xs text-medium-gray mt-1">
            Fique atento ao seu WhatsApp para novas ofertas!
          </p>
        </Card>
      </div>
    </div>
  );
}
