import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
