import { api } from '../api';
import { imagesService } from './images.service';

export interface Setting {
    key: string;
    value: string;
    description: string;
    updated_at: string;
}

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
        return await imagesService.uploadImage(0, file);
    }
};
