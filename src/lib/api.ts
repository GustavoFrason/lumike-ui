/**
 * api.ts
 * ------------------------------------
 * Responsável por centralizar chamadas HTTP ao backend Lumike (NestJS).
 * Usa axios e faz chamadas através das API routes do Next.js (que têm acesso ao cookie httpOnly).
 */

import axios from 'axios';

// URL base das API routes do Next.js (proxy para o backend)
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Permite envio de cookies (incluindo httpOnly)
});

// Interceptor para tratar erros 401 (não autorizado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Se não estiver na página de login, redireciona
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.warn('[API] Token inválido ou expirado. Limpando sessão...');

        // Remove localStorage
        localStorage.removeItem('token');

        // Chama a rota de logout para limpar o cookie httpOnly
        try {
          // Usamos axios puro para evitar o interceptor da própria 'api'
          await axios.post('/api/logout');
        } catch (e) {
          console.error('[API] Falha ao limpar cookie de sessão:', e);
        }

        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  },
);

// Tipos para respostas da API
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
