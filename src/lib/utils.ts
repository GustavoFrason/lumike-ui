import axios from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extrai uma mensagem de erro legível de um `catch (err)` — cobre o
 * formato de erro da API via axios (err.response.data.message), Error
 * padrão do JS, e string solta, com fallback para o resto.
 *
 * Essa lógica (`err.response?.data?.message || err.message || fallback`)
 * estava copiada, com `err: any`, em pelo menos 10 lugares diferentes.
 */
export function getErrorMessage(err: unknown, fallback = 'Erro inesperado'): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || fallback;
  }
  if (err instanceof Error) {
    return err.message || fallback;
  }
  if (typeof err === 'string') {
    return err;
  }
  return fallback;
}

export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('http')) return url;

  const lowerUrl = url.toLowerCase();
  const publicIndex = lowerUrl.indexOf('public');

  if (publicIndex !== -1) {
    // Pega tudo após "public", garante que começa com / e usa forward slashes
    let relative = url.substring(publicIndex + 6).replace(/\\/g, '/');
    if (!relative.startsWith('/')) relative = '/' + relative;
    return relative;
  }

  return url;
}
