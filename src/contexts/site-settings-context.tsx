'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { settingsService, Setting, STORE_SETTING_KEYS } from '@/lib/services/settings.service';
import { normalizeWhatsappNumber } from '@/lib/utils/whatsapp';

/** Dados da loja (site_settings) usados fora do painel de configurações. */
export interface SiteSettings {
  /** Só dígitos; vazio = não configurado (botões de WhatsApp escondidos). */
  whatsappNumber: string;
  /** Vazio = cobrança sai sem a chave Pix. */
  pixKey: string;
}

interface SiteSettingsContextType extends SiteSettings {
  /** Reflete na hora uma configuração salva em /admin/configuracoes. */
  setSetting: (key: string, value: string) => void;
}

const EMPTY_SETTINGS: SiteSettings = { whatsappNumber: '', pixKey: '' };

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  ...EMPTY_SETTINGS,
  setSetting: () => {},
});

export function parseSiteSettings(settings: Pick<Setting, 'key' | 'value'>[]): SiteSettings {
  const valueOf = (key: string) => settings.find((s) => s.key === key)?.value ?? '';
  return {
    whatsappNumber: normalizeWhatsappNumber(valueOf(STORE_SETTING_KEYS.whatsappNumber)),
    pixKey: valueOf(STORE_SETTING_KEYS.pixKey).trim(),
  };
}

export function SiteSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  /** Já buscadas no servidor: dispensa a busca no cliente. */
  initialSettings?: Pick<Setting, 'key' | 'value'>[];
}) {
  const [settings, setSettings] = useState<Pick<Setting, 'key' | 'value'>[]>(initialSettings ?? []);
  const hasInitialSettings = initialSettings !== undefined;

  useEffect(() => {
    if (hasInitialSettings) return;

    let cancelled = false;
    settingsService
      .getAll()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch((error) => {
        // Sem configurações a vitrine só esconde os botões de WhatsApp.
        console.error('Erro carregando configurações da loja', error);
      });

    return () => {
      cancelled = true;
    };
  }, [hasInitialSettings]);

  const setSetting = useCallback((key: string, value: string) => {
    setSettings((prev) =>
      prev.some((s) => s.key === key)
        ? prev.map((s) => (s.key === key ? { ...s, value } : s))
        : [...prev, { key, value }],
    );
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ ...parseSiteSettings(settings), setSetting }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
