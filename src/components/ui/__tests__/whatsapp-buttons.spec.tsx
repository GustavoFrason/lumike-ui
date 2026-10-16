import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WhatsAppButton } from '../whatsapp-button';
import { FloatingWhatsApp } from '../floating-whatsapp';
import {
  parseSiteSettings,
  SiteSettingsProvider,
  useSiteSettings,
} from '@/contexts/site-settings-context';
import { settingsService } from '@/lib/services/settings.service';

const configured = [
  { key: 'whatsapp_number', value: '+55 (11) 98765-4321' },
  { key: 'pix_key', value: ' loja@pix.com ' },
];

function renderWith(ui: React.ReactElement, initialSettings = configured) {
  return render(
    <SiteSettingsProvider initialSettings={initialSettings}>{ui}</SiteSettingsProvider>,
  );
}

afterEach(() => jest.restoreAllMocks());

describe('parseSiteSettings', () => {
  it('normalizes the WhatsApp number and trims the Pix key', () => {
    expect(parseSiteSettings(configured)).toEqual({
      whatsappNumber: '5511987654321',
      pixKey: 'loja@pix.com',
    });
  });

  it('is empty when the keys do not exist', () => {
    expect(parseSiteSettings([])).toEqual({ whatsappNumber: '', pixKey: '' });
  });
});

describe('WhatsAppButton', () => {
  it('opens wa.me with the configured number and the product name', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    renderWith(<WhatsAppButton productName="Anel Solitário" variant="full" />);

    fireEvent.click(screen.getByRole('button', { name: /pedir no whatsapp/i }));

    expect(open).toHaveBeenCalledWith(
      `https://wa.me/5511987654321?text=${encodeURIComponent(
        'Olá! Gostaria de mais informações sobre o produto: Anel Solitário',
      )}`,
      '_blank',
    );
  });

  it('is not rendered without a configured number', () => {
    renderWith(<WhatsAppButton productName="Anel" variant="full" />, []);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('FloatingWhatsApp', () => {
  it('links to the configured number', () => {
    renderWith(<FloatingWhatsApp />);
    expect(screen.getByRole('link', { name: /falar no whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringMatching(/^https:\/\/wa\.me\/5511987654321\?text=/),
    );
  });

  it('is not rendered without a configured number', () => {
    renderWith(<FloatingWhatsApp />, []);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('SiteSettingsProvider', () => {
  it('loads the settings from the API when none were given', async () => {
    jest
      .spyOn(settingsService, 'getAll')
      .mockResolvedValue(configured.map((s) => ({ ...s, description: '', updated_at: '' })));
    render(
      <SiteSettingsProvider>
        <FloatingWhatsApp />
      </SiteSettingsProvider>,
    );

    expect(await screen.findByRole('link', { name: /falar no whatsapp/i })).toBeInTheDocument();
  });

  it('reflects a setting saved in the admin without reloading', () => {
    function SaveNumber() {
      const { setSetting } = useSiteSettings();
      return <button onClick={() => setSetting('whatsapp_number', '5511912345678')}>salvar</button>;
    }
    renderWith(
      <>
        <SaveNumber />
        <FloatingWhatsApp />
      </>,
      [],
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'salvar' }));

    expect(screen.getByRole('link', { name: /falar no whatsapp/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/5511912345678'),
    );
  });
});
