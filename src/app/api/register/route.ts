import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Erro ao cadastrar' },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno ao cadastrar' },
      { status: 500 },
    );
  }
}
