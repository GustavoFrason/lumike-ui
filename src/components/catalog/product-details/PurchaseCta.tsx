import { Truck, ShieldCheck } from 'lucide-react';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { Product } from '@/lib/services/products.service';
import { StockNotifyForm } from './StockNotifyForm';

interface PurchaseCtaProps {
  product: Product;
}

export function PurchaseCta({ product }: PurchaseCtaProps) {
  return (
    <div className="space-y-6 pt-4">
      {product.current_stock > 0 ? (
        <WhatsAppButton
          productName={product.name}
          variant="full"
          className="w-full bg-primary-gold text-white font-montserrat font-bold uppercase tracking-widest py-4 hover:bg-light-gold hover:text-deep-black hover:scale-[1.02] transition-all shadow-luxury"
        />
      ) : (
        <StockNotifyForm product={product} />
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-medium-gray font-inter">
        <ShieldCheck className="w-4 h-4" />
        <span>Garantia de 1 ano</span>
        <span className="w-1 h-1 bg-medium-gray rounded-full mx-2" />
        <Truck className="w-4 h-4" />
        <span>Envio para todo o Brasil</span>
      </div>
    </div>
  );
}
