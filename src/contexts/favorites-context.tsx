'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { favoritesService } from '@/lib/services/favorites.service';
import { useSession } from '@/contexts/session-context';

interface FavoritesContextType {
  favoriteIds: number[];
  toggleFavorite: (productId: number) => Promise<void>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: [],
  toggleFavorite: async () => {},
  isLoading: false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoading] = useState(false);

  // Carrega os favoritos quando a sessão fica conhecida (e de novo em
  // login/logout). Só chama a API logado: deslogado o backend responde 401
  // e o interceptor do axios mandaria para a tela de login.
  useEffect(() => {
    if (status !== 'authenticated') {
      setFavoriteIds([]);
      return;
    }

    let cancelled = false;
    favoritesService
      .getFavoriteIds()
      .then((ids) => {
        if (!cancelled) setFavoriteIds(ids);
      })
      .catch((error) => {
        console.error('Erro carregando favoritos', error);
        if (!cancelled) setFavoriteIds([]);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const toggleFavorite = async (productId: number) => {
    if (status !== 'authenticated') {
      alert('Faça login para favoritar produtos!');
      return;
    }

    // Optimistic Update
    const isFaving = !favoriteIds.includes(productId);
    setFavoriteIds((prev) =>
      isFaving ? [...prev, productId] : prev.filter((id) => id !== productId),
    );

    try {
      const result = await favoritesService.toggle(productId);
      // Sincroniza o estado real retornado pelo servidor
      if (result.isFavorite !== isFaving) {
        setFavoriteIds((prev) =>
          result.isFavorite ? [...prev, productId] : prev.filter((id) => id !== productId),
        );
      }
    } catch (error) {
      console.error('Erro ao salvar favorito', error);
      // Revert on error
      setFavoriteIds((prev) =>
        isFaving ? prev.filter((id) => id !== productId) : [...prev, productId],
      );
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
