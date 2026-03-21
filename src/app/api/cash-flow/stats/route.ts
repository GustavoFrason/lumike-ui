import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days') || '30';
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  try {
    const response = await axios.get(`${API_URL}/cash-flow/stats`, {
      params: { days },
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
