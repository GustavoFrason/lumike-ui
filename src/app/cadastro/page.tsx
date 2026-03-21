'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Using axios for consistency with LoginForm
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    senha: '',
    confirmSenha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Field Validation State
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    whatsapp: '',
    confirmSenha: '',
  });

  // Password Validation State (Restored)
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    symbol: false,
  });
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const router = useRouter();

  const validateField = (name: string, value: string) => {
    let errorMessage = '';

    switch (name) {
      case 'name':
        if (!value.trim()) errorMessage = 'Nome é obrigatório.';
        else if (value.trim().split(' ').length < 2)
          errorMessage = 'Digite seu nome completo (Sobrenome).';
        break;
      case 'email':
        if (!value.trim()) errorMessage = 'E-mail é obrigatório.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          errorMessage = 'Digite um e-mail válido.';
        break;
      case 'whatsapp':
        // Optional field, but if filled, must be valid length
        if (value && value.replace(/\D/g, '').length < 10)
          errorMessage = 'WhatsApp inválido (mínimo 10 dígitos).';
        break;
      case 'confirmSenha':
        if (value !== formData.senha) errorMessage = 'As senhas não conferem.';
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
    return errorMessage === '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    // Masking Logic
    if (name === 'whatsapp') {
      let v = value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11);

      if (v.length > 0) newValue = `(${v}`;
      if (v.length > 2) newValue = `(${v.substring(0, 2)}) ${v.substring(2)}`;
      if (v.length > 7) newValue = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
    }

    setFormData({ ...formData, [name]: newValue });

    // Clear error when user starts typing again
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'senha') {
      const rules = {
        length: newValue.length >= 8,
        uppercase: /[A-Z]/.test(newValue),
        symbol: /[!@#$%^&*(),.?":{}|<>]/.test(newValue),
      };
      setPasswordCriteria(rules);
      // Re-validate confirm password if main password changes
      if (formData.confirmSenha) {
        if (formData.confirmSenha !== newValue) {
          setFieldErrors((prev) => ({ ...prev, confirmSenha: 'As senhas não conferem.' }));
        } else {
          setFieldErrors((prev) => ({ ...prev, confirmSenha: '' }));
        }
      }
    }

    if (name === 'confirmSenha') {
      if (newValue !== formData.senha) {
        // Don't show error immediately on typing, wait for blur or full match
      } else {
        setFieldErrors((prev) => ({ ...prev, confirmSenha: '' }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const isFormValid =
    isPasswordValid &&
    !Object.values(fieldErrors).some(Boolean) &&
    formData.name &&
    formData.email &&
    formData.confirmSenha === formData.senha;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all before submitting
    const isNameValid = validateField('name', formData.name);
    const isEmailValid = validateField('email', formData.email);
    const isWhatsappValid = validateField('whatsapp', formData.whatsapp);

    if (!isNameValid || !isEmailValid || !isWhatsappValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/register', {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        senha: formData.senha,
      });

      if (response.data.success) {
        // Redirect to login with success message
        router.push('/login?registered=true');
      } else {
        setError(response.data.message || 'Erro ao cadastrar.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-10">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-playfair font-bold text-deep-black">
            Crie sua conta
          </CardTitle>
          <p className="text-center text-xs text-medium-gray mt-1">
            Preencha seus dados para acessar a área exclusiva.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-deep-black pl-1">Nome Completo</label>
              <Input
                name="name"
                type="text"
                placeholder="Ex: João Silva"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
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
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`bg-white ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.email && (
                <p className="text-[10px] text-red-500 font-medium pl-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-deep-black pl-1">
                WhatsApp (Opcional)
              </label>
              <Input
                name="whatsapp"
                type="text"
                placeholder="Ex: (41) 99999-9999"
                value={formData.whatsapp}
                onChange={handleChange}
                onBlur={handleBlur}
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
                onChange={handleChange}
                onFocus={() => setShowPasswordRules(true)}
                required
                className="bg-white"
              />

              {/* Password Strength Indicator */}
              {showPasswordRules && (
                <div className="mt-2 p-3 bg-gray-50/50 border border-gray-100 rounded text-xs text-medium-gray space-y-1 transition-all">
                  <p className="font-bold mb-1 text-deep-black">Sua senha deve ter:</p>
                  <div
                    className={`flex items-center gap-2 ${passwordCriteria.length ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.length ? 'bg-green-600' : 'bg-gray-300'}`}
                    />
                    Mínimo de 8 caracteres
                  </div>
                  <div
                    className={`flex items-center gap-2 ${passwordCriteria.uppercase ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.uppercase ? 'bg-green-600' : 'bg-gray-300'}`}
                    />
                    Pelo menos 1 letra maiúscula
                  </div>
                  <div
                    className={`flex items-center gap-2 ${passwordCriteria.symbol ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.symbol ? 'bg-green-600' : 'bg-gray-300'}`}
                    />
                    Pelo menos 1 símbolo (!@#...)
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-deep-black pl-1">Confirmar Senha</label>
              <Input
                name="confirmSenha"
                type="password"
                placeholder="Repita a senha"
                value={formData.confirmSenha}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`bg-white ${fieldErrors.confirmSenha ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {fieldErrors.confirmSenha && (
                <p className="text-[10px] text-red-500 font-medium pl-1">
                  {fieldErrors.confirmSenha}
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-deep-black hover:bg-primary-gold text-white font-bold uppercase tracking-widest mt-2 h-12 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Cadastrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-medium-gray">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-bold text-deep-black hover:text-primary-gold underline"
            >
              Fazer Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
