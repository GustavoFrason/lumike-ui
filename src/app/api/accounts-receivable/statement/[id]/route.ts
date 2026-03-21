import { NextRequest } from 'next/server';
import { handleGet } from '@/lib/api-helpers';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await cookies(); // Ensure cookies are loaded for auth
  const { id } = await params;
  return handleGet(
    request,
    `/accounts-receivable/statement/${id}`,
    'Erro ao buscar extrato do cliente',
  );
}
