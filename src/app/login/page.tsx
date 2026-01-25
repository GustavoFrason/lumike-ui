/**
 * /login
 * ------------------------------------
 * Se já estiver autenticado, redireciona direto ao dashboard.
 */

import { redirect } from 'next/navigation';
import { getAuthCookie } from '@/lib/cookies';
import { LoginForm } from '@/components/forms/LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const token = await getAuthCookie();
  // if (token) redirect('/admin'); // Removed to avoid indiscriminate redirect
  return <LoginForm />;
}