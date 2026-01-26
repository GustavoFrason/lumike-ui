import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const body = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const { id } = await params;

    try {
        const response = await axios.post(`${API_URL}/orders/${id}/cancel`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.response?.data?.message || 'Internal Server Error' },
            { status: error.response?.status || 500 },
        );
    }
}
