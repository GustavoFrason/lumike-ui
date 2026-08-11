import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthHints } from './PasswordStrengthHints';

interface RegisterFormData {
  name: string;
  email: string;
  whatsapp: string;
  senha: string;
  confirmSenha: string;
}

interface RegisterFieldErrors {
  name: string;
  email: string;
  whatsapp: string;
  confirmSenha: string;
}

interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  symbol: boolean;
}

interface RegisterFormProps {
  formData: RegisterFormData;
  fieldErrors: RegisterFieldErrors;
  passwordCriteria: PasswordCriteria;
  showPasswordRules: boolean;
  onShowPasswordRules: () => void;
  error: string;
  loading: boolean;
  isFormValid: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function RegisterForm({
  formData,
  fieldErrors,
  passwordCriteria,
  showPasswordRules,
  onShowPasswordRules,
  error,
  loading,
  isFormValid,
  onChange,
  onBlur,
  onSubmit,
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-deep-black pl-1">Nome Completo</label>
        <Input
          name="name"
          type="text"
          placeholder="Ex: João Silva"
          value={formData.name}
          onChange={onChange}
          onBlur={onBlur}
          required
          className={`bg-white ${fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.name && (
          <p className="text-[10px] text-red-500 font-medium pl-1">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-deep-black pl-1">E-mail</label>
        <Input
          name="email"
          type="email"
          placeholder="Ex: joao@email.com"
          value={formData.email}
          onChange={onChange}
          onBlur={onBlur}
          required
          className={`bg-white ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.email && (
          <p className="text-[10px] text-red-500 font-medium pl-1">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-deep-black pl-1">WhatsApp (Opcional)</label>
        <Input
          name="whatsapp"
          type="text"
          placeholder="Ex: (41) 99999-9999"
          value={formData.whatsapp}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={15}
          className={`bg-white ${fieldErrors.whatsapp ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.whatsapp && (
          <p className="text-[10px] text-red-500 font-medium pl-1">{fieldErrors.whatsapp}</p>
        )}
      </div>

      <div className="relative space-y-1">
        <label className="text-sm font-medium text-deep-black pl-1">Senha</label>
        <Input
          name="senha"
          type="password"
          placeholder="Crie uma senha forte"
          value={formData.senha}
          onChange={onChange}
          onFocus={onShowPasswordRules}
          required
          className="bg-white"
        />

        {showPasswordRules && <PasswordStrengthHints criteria={passwordCriteria} />}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-deep-black pl-1">Confirmar Senha</label>
        <Input
          name="confirmSenha"
          type="password"
          placeholder="Repita a senha"
          value={formData.confirmSenha}
          onChange={onChange}
          onBlur={onBlur}
          required
          className={`bg-white ${fieldErrors.confirmSenha ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.confirmSenha && (
          <p className="text-[10px] text-red-500 font-medium pl-1">{fieldErrors.confirmSenha}</p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

      <Button
        type="submit"
        disabled={loading || !isFormValid}
        className="w-full bg-deep-black hover:bg-primary-gold text-white font-bold uppercase tracking-widest mt-2 h-12 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Cadastrar'}
      </Button>
    </form>
  );
}
