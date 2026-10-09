/**
 * LoginForm
 * ------------------------------------
 * Formulário de login com redirecionamento ao dashboard.
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/contexts/session-context';
import { stockNotificationsService } from '@/lib/services/stock-notifications.service';

/**
 * Só aceita redirecionar para um caminho interno do próprio site. Sem
 * isso, `/login?redirect=https://site-falso.com` levava o usuário recém
 * logado para fora (open redirect).
 */
function getSafeRedirect(redirect: string | null): string | null {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) return null;
  if (redirect.includes('\\')) return null;
  return redirect;
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { refresh: refreshSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // O token fica só no cookie httpOnly gravado por /api/login.
      const response = await axios.post('/api/login', { email, senha });
      if (response.data.success) {
        const user = response.data.user;

        // --- Lógica de Alerta de Estoque Pendente ---
        const pendingAlert =
          typeof window !== 'undefined' ? localStorage.getItem('pending_stock_alert') : null;
        if (pendingAlert) {
          try {
            const alertData = JSON.parse(pendingAlert);
            // O cookie acabou de ser gravado: o backend identifica o
            // usuário pelo JWT (e-mail incluso).
            await stockNotificationsService.create({
              product_id: alertData.product_id,
              variant_id: alertData.variant_id,
            });
            localStorage.removeItem('pending_stock_alert');
          } catch (err) {
            console.error('Erro ao registrar alerta pendente:', err);
          }
        }
        // ------------------------------------------

        await refreshSession();

        const redirectPath = getSafeRedirect(searchParams.get('redirect'));
        if (redirectPath) {
          router.replace(redirectPath);
          return;
        }

        // Papéis de staff reais (ver StaffRole no backend): 'superadmin' nunca existiu no banco.
        if (user.role === 'admin' || user.role === 'gestor') {
          router.replace('/admin');
        } else {
          router.replace('/minha-conta');
        }
      } else {
        setErro(response.data.message || 'Erro ao autenticar');
      }
    } catch {
      setErro('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {registered && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md shadow-sm w-[380px] text-center text-sm font-medium">
          Conta criada com sucesso! <br /> Faça login para continuar.
        </div>
      )}

      <Card className="w-[380px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Acesso Administrativo – Lumilee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center mt-6 text-sm text-medium-gray">
        Não tem cadastro?{' '}
        <a
          href="/cadastro"
          className="font-bold text-deep-black hover:text-primary-gold underline transition-colors"
        >
          Criar conta
        </a>
      </p>
    </div>
  );
}
