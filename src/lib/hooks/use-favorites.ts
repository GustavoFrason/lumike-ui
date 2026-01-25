/**
 * use-favorites.ts
 * ------------------------------------
 * Hook específico para operações com favoritos.
 */

import { useCallback } from 'react';
import { useApi } from './use-api';
import { favoritesService, FavoriteItem } from '../services/favorites.service';

export function useFavorites() {
    const { execute: executeList, ...listApi } = useApi<FavoriteItem[]>();
    const { execute: executeIds, ...idsApi } = useApi<number[]>();
    const { execute: executeToggle, ...toggleApi } = useApi<{ isFavorite: boolean }>();

    const loadFavorites = useCallback(async () => {
        return executeList(() => favoritesService.getAll());
    }, [executeList]);

    const loadFavoriteIds = useCallback(async () => {
        return executeIds(() => favoritesService.getFavoriteIds());
    }, [executeIds]);

    const toggleFavorite = useCallback(async (productId: number) => {
        return executeToggle(() => favoritesService.toggle(productId));
    }, [executeToggle]);

    return {
        // List
        favorites: listApi.data || [],
        loadingFavorites: listApi.loading,
        errorFavorites: listApi.error,
        loadFavorites,

        // IDs
        favoriteIds: idsApi.data || [],
        loadingIds: idsApi.loading,
        loadFavoriteIds,

        // Toggle
        toggling: toggleApi.loading,
        toggleFavorite,

        // Actions
        reset: () => {
            listApi.reset();
            idsApi.reset();
            toggleApi.reset();
        }
    };
}
