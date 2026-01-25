import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    try {
        const response = await axios.get(`${API_URL}/cash-flow`, {
            params: { limit },
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

export async function POST(request: Request) {
    const body = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    try {
        const response = await axios.post(`${API_URL}/cash-flow`, body, {
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
