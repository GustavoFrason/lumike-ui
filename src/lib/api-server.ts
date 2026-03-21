// import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

export async function fetchServer<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  const url = `${API_URL}${path}${queryString}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Opcional: passar cookies/auth se necessário (para vitrine pública não precisa)
  // const cookieStore = cookies();
  // const token = cookieStore.get('token');
  // if (token) {
  //   defaultHeaders['Authorization'] = `Bearer ${token.value}`;
  // }

  const response = await fetch(url, {
    headers: { ...defaultHeaders, ...headers } as HeadersInit,
    cache: 'no-store', // ou 'force-cache' dependendo da estratégia desejada, 'no-store' garante dados frescos
    ...rest,
  });

  if (!response.ok) {
    if (response.status === 404) return null as T;
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Error fetching ${url}: ${response.statusText}`;

    // Log estruturado para debugging
    console.error('[API Error]', {
      url,
      status: response.status,
      statusText: response.statusText,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    throw new Error(errorMessage);
  }

  return response.json();
}
