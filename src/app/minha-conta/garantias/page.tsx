'use client';

import { Card } from '@/components/ui/card';
import { ShieldCheck, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WarrantiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold mb-2">Minhas Garantias</h1>
        <p className="text-medium-gray text-sm">
          Acesse os certificados digitais de autenticidade das suas joias.
        </p>
      </div>

      <div className="space-y-4">
        {/* Mock Warranty Item */}
        <Card className="p-6 bg-white border border-light-gray flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center">
              {/* Placeholder for product image */}
              <ShieldCheck className="w-8 h-8 text-medium-gray" />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-bold text-deep-black">
                Anel Solitário Ouro 18k
              </h3>
              <p className="text-xs text-medium-gray">Adquirido em 12/12/2025</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-primary-gold/10 text-primary-gold text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Garantia Vitalícia
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              className="flex-1 md:flex-none gap-2 text-xs uppercase tracking-wider font-bold h-10"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
            <Button className="flex-1 md:flex-none gap-2 text-xs uppercase tracking-wider font-bold h-10 bg-deep-black text-white hover:bg-primary-gold">
              <ExternalLink className="w-4 h-4" />
              Solicitar Reparo
            </Button>
          </div>
        </Card>

        <div className="text-center py-10">
          <p className="text-sm text-medium-gray">
            Dúvidas sobre sua garantia?
            <a href="#" className="text-deep-black font-bold ml-1 underline">
              Fale com nosso concierge.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
