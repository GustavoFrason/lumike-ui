import { Gift } from 'lucide-react';

interface LeadCaptureSuccessProps {
  coupon: string;
}

export function LeadCaptureSuccess({ coupon }: LeadCaptureSuccessProps) {
  return (
    <div className="py-10 space-y-6">
      <Gift className="w-16 h-16 text-primary-gold mx-auto" />
      <div className="space-y-2">
        <h3 className="font-playfair text-2xl text-deep-black">Parabéns!</h3>
        <p className="font-inter text-md text-medium-gray">
          Este é seu código exclusivo. <br />
          <span className="font-bold text-deep-black">Tire um print</span> ou copie agora:
        </p>
      </div>

      <div className="bg-white border-2 border-dashed border-primary-gold p-4 mt-6">
        <span className="font-montserrat text-2xl font-bold text-deep-black tracking-widest select-all">
          {coupon}
        </span>
      </div>

      <p className="text-xs text-medium-gray">Válido por 24 horas.</p>
    </div>
  );
}
