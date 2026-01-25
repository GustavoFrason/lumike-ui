import { NextRequest } from 'next/server';
import { handleDelete } from '@/lib/api-helpers';

const BACKEND_PATH = '/accessory-purchases';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Type adjusted for Next.js 15+ param behavior if needed, but 14 is simpler. Using Promise due to recent lints.
) {
    const { id } = await params;
    return handleDelete(BACKEND_PATH, id, 'Erro ao remover compra de acessório');
}
