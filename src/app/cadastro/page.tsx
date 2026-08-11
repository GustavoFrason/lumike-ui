'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Using axios for consistency with LoginForm
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/utils';
import { RegisterForm } from './components/RegisterForm';

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
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao conectar com o servidor.'));
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
          <RegisterForm
            formData={formData}
            fieldErrors={fieldErrors}
            passwordCriteria={passwordCriteria}
            showPasswordRules={showPasswordRules}
            onShowPasswordRules={() => setShowPasswordRules(true)}
            error={error}
            loading={loading}
            isFormValid={!!isFormValid}
            onChange={handleChange}
            onBlur={handleBlur}
            onSubmit={handleSubmit}
          />
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
