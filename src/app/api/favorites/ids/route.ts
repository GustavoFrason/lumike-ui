import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/favorites/ids`, {
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader ? { 'Authorization': authHeader } : {}),
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json([], { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao buscar IDs favoritos:', error);
        return NextResponse.json([], { status: 500 });
    }
}
