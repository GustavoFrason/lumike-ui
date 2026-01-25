'use client';

import { useEffect } from 'react';
import { useFavorites } from '@/contexts/favorites-context';
import { useFavorites as useFavoritesData } from '@/lib/hooks/use-favorites';
import { ProductCard } from '@/components/catalog/product-card';
import { Loading } from '@/components/ui/loading';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function MyFavoritesPage() {
    const { favoriteIds } = useFavorites();
    const { favorites, loadingFavorites, loadFavorites } = useFavoritesData();

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites, favoriteIds]);

    if (loadingFavorites && favorites.length === 0) {
        return <Loading size="lg" text="Carregando seus favoritos..." className="py-20" />;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-light-gray pb-6">
                <div>
                    <h1 className="font-playfair text-3xl font-bold text-deep-black mb-2">Meus Favoritos</h1>
                    <p className="text-medium-gray text-sm">
                        {favorites.length} {favorites.length === 1 ? 'item salvo' : 'itens salvos'} na sua lista de desejos.
                    </p>
                </div>
            </div>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {favorites.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-light-gray p-12 text-center space-y-6">
                    <div className="w-16 h-16 bg-off-white rounded-full flex items-center justify-center mx-auto text-medium-gray">
                        <Heart className="w-8 h-8" />
                    </div>
                    <div className="max-w-xs mx-auto space-y-2">
                        <p className="font-playfair text-xl font-bold">Sua lista está vazia</p>
                        <p className="text-medium-gray text-sm">
                            Você ainda não salvou nenhum produto como favorito. Explore nossa coleção e encontre algo especial!
                        </p>
                    </div>
                    <Link
                        href="/produtos"
                        className="inline-flex items-center gap-2 bg-primary-gold text-white px-8 py-3 font-montserrat text-xs uppercase tracking-widest hover:bg-deep-black transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Explorar Coleções
                    </Link>
                </div>
            )}
        </div>
    );
}
