import { cache } from 'react';
import { fetchServer } from './api-server';
import type { Setting } from './services/settings.service';

/** API lenta não pode segurar a página inteira: depois disso, segue sem. */
const SETTINGS_TIMEOUT_MS = 3000;

/**
 * Configurações da loja (site_settings) para Server Components.
 *
 * O `cache` faz o layout raiz e a home dividirem uma só chamada à API por
 * requisição. Devolve `null` se a API falhar ou demorar: aí o
 * `SiteSettingsProvider` busca no navegador, como fazia antes.
 */
export const getSiteSettings = cache(async (): Promise<Pick<Setting, 'key' | 'value'>[] | null> => {
  try {
    const data = await fetchServer<Setting[]>('/settings', {
      signal: AbortSignal.timeout(SETTINGS_TIMEOUT_MS),
    });
    return (data ?? []).map(({ key, value }) => ({ key, value }));
  } catch (error) {
    console.error('Erro carregando configurações da loja', error);
    return null;
  }
});
