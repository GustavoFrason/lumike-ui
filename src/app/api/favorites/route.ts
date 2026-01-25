import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/favorites`, {
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { 'Authorization': authHeader } : {}),
            },
            cache: 'no-store'
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Erro ao buscar favoritos' },
                { status: response.status },
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao buscar favoritos:', error);
        return NextResponse.json(
            { success: false, message: 'Erro interno' },
            { status: 500 },
        );
    }
}
