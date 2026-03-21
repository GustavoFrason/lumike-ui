/**
 * Favorites Service
 * --------------------
 * Serviço para gerenciar produtos favoritos do usuário.
 */

import { api } from '../api';
import { Product } from './products.service';

export interface FavoriteItem extends Product {
  favorite_id: number;
  favorited_at: string;
}

export const favoritesService = {
  /**
   * Adiciona ou remove um produto dos favoritos
   */
  async toggle(productId: number): Promise<{ isFavorite: boolean }> {
    const { data } = await api.post<{ isFavorite: boolean }>('/favorites/toggle', { productId });
    return data;
  },

  /**
   * Busca os IDs dos produtos favoritos do usuário logado
   */
  async getFavoriteIds(): Promise<number[]> {
    const { data } = await api.get<number[]>('/favorites/ids');
    return data;
  },

  /**
   * Lista todos os produtos favoritos do usuário logado
   */
  async getAll(): Promise<FavoriteItem[]> {
    const { data } = await api.get<FavoriteItem[]>('/favorites');
    return data;
  },
};
