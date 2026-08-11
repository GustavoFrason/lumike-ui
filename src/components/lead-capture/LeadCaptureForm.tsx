import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldError } from './FieldError';

interface LeadFormData {
  name: string;
  email: string;
  whatsapp: string;
  birthday: string;
}

interface LeadCaptureFormProps {
  formData: LeadFormData;
  errors: Record<string, string>;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onBirthdayChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LeadCaptureForm({
  formData,
  errors,
  loading,
  onEmailChange,
  onNameChange,
  onBirthdayChange,
  onWhatsappChange,
  onBlur,
  onSubmit,
}: LeadCaptureFormProps) {
  return (
    <>
      <div className="space-y-1 mb-8">
        <p className="font-montserrat text-lg font-bold text-deep-black uppercase tracking-widest">
          10% OFF
        </p>
        <p className="font-inter text-sm text-medium-gray">Promoção Relâmpago</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className={cn(
              'w-full bg-white border p-3 text-sm font-inter outline-none transition-colors',
              errors.email
                ? 'border-red-400 focus:border-red-500'
                : 'border-light-gray focus:border-primary-gold',
            )}
            value={formData.email}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={onBlur}
          />
          <FieldError message={errors.email} />
        </div>

        <div className="relative">
          <input
            type="text"
            name="name"
            placeholder="Nome Completo"
            required
            className={cn(
              'w-full bg-white border p-3 text-sm font-inter outline-none transition-colors',
              errors.name
                ? 'border-red-400 focus:border-red-500'
                : 'border-light-gray focus:border-primary-gold',
            )}
            value={formData.name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={onBlur}
          />
          <FieldError message={errors.name} />
        </div>

        <div className="relative">
          <input
            type="text"
            name="birthday"
            placeholder="Data de Nascimento (DD/MM/AAAA)"
            required
            maxLength={10}
            className={cn(
              'w-full bg-white border p-3 text-sm font-inter outline-none transition-colors',
              errors.birthday
                ? 'border-red-400 focus:border-red-500'
                : 'border-light-gray focus:border-primary-gold',
            )}
            value={formData.birthday}
            onChange={(e) => onBirthdayChange(e.target.value)}
            onBlur={onBlur}
          />
          <FieldError message={errors.birthday} />
        </div>

        <div className="relative">
          <input
            type="text"
            name="whatsapp"
            placeholder="WhatsApp (com DDD)"
            required
            maxLength={15}
            className={cn(
              'w-full bg-white border p-3 text-sm font-inter outline-none transition-colors',
              errors.whatsapp
                ? 'border-red-400 focus:border-red-500'
                : 'border-light-gray focus:border-primary-gold',
            )}
            value={formData.whatsapp}
            onChange={(e) => onWhatsappChange(e.target.value)}
            onBlur={onBlur}
          />
          <FieldError message={errors.whatsapp} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5D4037] text-white font-montserrat font-bold uppercase tracking-widest py-4 hover:bg-[#3E2723] transition-colors mt-4 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Receber Desconto'}
        </button>
      </form>

      <p className="text-[10px] text-medium-gray mt-4">
        O código aparecerá na tela imediatamente após o cadastro.
      </p>
    </>
  );
}
