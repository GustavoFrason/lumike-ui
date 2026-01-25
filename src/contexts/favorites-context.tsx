'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { favoritesService } from '@/lib/services/favorites.service';

interface FavoritesContextType {
    favoriteIds: number[];
    toggleFavorite: (productId: number) => Promise<void>;
    isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
    favoriteIds: [],
    toggleFavorite: async () => { },
    isLoading: false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadFavorites = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setFavoriteIds([]);
            return;
        }

        try {
            const ids = await favoritesService.getFavoriteIds();
            setFavoriteIds(ids);
        } catch (error) {
            console.error("Erro carregando favoritos", error);
            setFavoriteIds([]);
        }
    };

    // Carregar favoritos ao montar
    useEffect(() => {
        loadFavorites();

        // Listener para login/logout
        window.addEventListener('storage', loadFavorites);
        return () => window.removeEventListener('storage', loadFavorites);
    }, []);

    const toggleFavorite = async (productId: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Faça login para favoritar produtos!');
            return;
        }

        // Optimistic Update
        const isFaving = !favoriteIds.includes(productId);
        setFavoriteIds(prev => isFaving ? [...prev, productId] : prev.filter(id => id !== productId));

        try {
            const result = await favoritesService.toggle(productId);
            // Sincroniza o estado real retornado pelo servidor
            if (result.isFavorite !== isFaving) {
                setFavoriteIds(prev => result.isFavorite ? [...prev, productId] : prev.filter(id => id !== productId));
            }
        } catch (error) {
            console.error('Erro ao salvar favorito', error);
            // Revert on error
            setFavoriteIds(prev => isFaving ? prev.filter(id => id !== productId) : [...prev, productId]);
            alert('Erro ao salvar favorito.');
        }
    };

    return (
        <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isLoading }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export const useFavorites = () => useContext(FavoritesContext);
