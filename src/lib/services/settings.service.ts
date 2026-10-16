import { api } from '../api';
import { imagesService } from './images.service';

export interface Setting {
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

/** Chaves de site_settings editadas em Configurações → Dados da Loja. */
export const STORE_SETTING_KEYS = {
  whatsappNumber: 'whatsapp_number',
  pixKey: 'pix_key',
} as const;

export const settingsService = {
  /**
   * Lista todas as configurações
   */
  async getAll(): Promise<Setting[]> {
    const { data } = await api.get<Setting[]>('/settings');
    return data;
  },

  /**
   * Busca uma configuração por chave
   */
  async getByKey(key: string): Promise<Setting> {
    const { data } = await api.get<Setting>(`/settings/${key}`);
    return data;
  },

  /**
   * Atualiza uma configuração
   */
  async update(key: string, value: string): Promise<Setting> {
    const { data } = await api.patch<Setting>(`/settings/${key}`, { value });
    return data;
  },

  async uploadBanner(file: File): Promise<string> {
    // Pasta própria — antes ia para "0/", como se fosse o produto de ID 0.
    return await imagesService.uploadBannerImage(file);
  },
};
