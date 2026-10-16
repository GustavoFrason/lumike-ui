'use client';

import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Setting, STORE_SETTING_KEYS } from '@/lib/services/settings.service';
import {
  buildWhatsappUrl,
  isValidWhatsappNumber,
  normalizeWhatsappNumber,
} from '@/lib/utils/whatsapp';

interface StoreContactSettingsProps {
  settings: Setting[];
  savingKey: string | null;
  /** Salva e devolve se deu certo. */
  onSave: (key: string, value: string) => Promise<boolean>;
}

const MIGRATION_NAME = '20261016000001_site_settings_contact.sql';

/**
 * Aba "Dados da Loja": WhatsApp de vendas (botões da vitrine) e chave Pix
 * (mensagem de cobrança em Clientes a Pagar). Salva ao sair do campo, como
 * o resto da tela.
 */
export function StoreContactSettings({ settings, savingKey, onSave }: StoreContactSettingsProps) {
  const valueOf = (key: string) => settings.find((s) => s.key === key)?.value ?? '';
  const missingKeys = Object.values(STORE_SETTING_KEYS).filter(
    (key) => !settings.some((s) => s.key === key),
  );

  const [whatsapp, setWhatsapp] = useState(valueOf(STORE_SETTING_KEYS.whatsappNumber));
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState(valueOf(STORE_SETTING_KEYS.pixKey));

  async function handleWhatsappBlur() {
    if (!isValidWhatsappNumber(whatsapp)) {
      setWhatsappError('Use DDI + DDD + número, só com dígitos (ex: 5511987654321).');
      return;
    }
    setWhatsappError(null);

    const digits = normalizeWhatsappNumber(whatsapp);
    setWhatsapp(digits);
    if (digits !== valueOf(STORE_SETTING_KEYS.whatsappNumber)) {
      await onSave(STORE_SETTING_KEYS.whatsappNumber, digits);
    }
  }

  async function handlePixBlur() {
    const value = pixKey.trim();
    setPixKey(value);
    if (value !== valueOf(STORE_SETTING_KEYS.pixKey)) {
      await onSave(STORE_SETTING_KEYS.pixKey, value);
    }
  }

  const testUrl = whatsappError ? null : buildWhatsappUrl(whatsapp);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-8">
      <h2 className="text-xl font-semibold font-serif">Contato e Pagamento</h2>

      {missingKeys.length > 0 && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          O banco ainda não tem {missingKeys.join(' e ')}. Aplique a migration{' '}
          <code className="font-mono">{MIGRATION_NAME}</code> no SQL Editor do Supabase antes de
          salvar.
        </p>
      )}

      <div className="space-y-3">
        <label htmlFor="whatsapp_number" className="block text-sm font-medium text-zinc-700">
          WhatsApp de vendas
        </label>
        <div className="relative">
          <input
            id="whatsapp_number"
            type="tel"
            inputMode="numeric"
            placeholder="5511987654321"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            onBlur={handleWhatsappBlur}
            aria-invalid={!!whatsappError}
            className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[var(--lumilee-gold)] focus:border-transparent outline-none transition"
          />
          {savingKey === STORE_SETTING_KEYS.whatsappNumber && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-[var(--lumilee-gold)]" size={16} />
            </div>
          )}
        </div>
        {whatsappError ? (
          <p className="text-xs text-red-600">{whatsappError}</p>
        ) : (
          <p className="text-xs text-zinc-500">
            Com DDI (55) e DDD. Usado nos botões &quot;Pedir no WhatsApp&quot; da vitrine — vazio
            esconde os botões.
          </p>
        )}
        {testUrl && (
          <a
            href={testUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--lumilee-gold)] hover:underline"
          >
            Testar link <ExternalLink size={12} />
          </a>
        )}
      </div>

      <div className="space-y-3">
        <label htmlFor="pix_key" className="block text-sm font-medium text-zinc-700">
          Chave Pix
        </label>
        <div className="relative">
          <input
            id="pix_key"
            type="text"
            placeholder="CNPJ, e-mail, telefone ou chave aleatória"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            onBlur={handlePixBlur}
            className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[var(--lumilee-gold)] focus:border-transparent outline-none transition"
          />
          {savingKey === STORE_SETTING_KEYS.pixKey && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-[var(--lumilee-gold)]" size={16} />
            </div>
          )}
        </div>
        <p className="text-xs text-zinc-500">
          Enviada na mensagem de cobrança em Clientes a Pagar — vazio, a mensagem sai sem a chave.
        </p>
      </div>
    </div>
  );
}
