'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/contexts/favorites-context';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface FavoriteButtonProps {
    productId: number;
    className?: string;
    variant?: 'icon' | 'text';
}

export function FavoriteButton({ productId, className, variant = 'icon' }: FavoriteButtonProps) {
    const { favoriteIds, toggleFavorite } = useFavorites();
    const isFavorite = favoriteIds.includes(productId);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
    };

    if (variant === 'text') {
        return (
            <Button
                variant="outline"
                onClick={handleClick}
                className={cn("gap-2", className)}
            >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
                {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            </Button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                "p-2 rounded-full transition-all hover:scale-110 active:scale-95 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md",
                isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500",
                className
            )}
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </button>
    );
}
