'use client';

import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { Product } from '@/lib/services/products.service';
import { formatCurrency } from '@/lib/formatters';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
// import { Heart } from 'lucide-react'; // Removing local Heart import if not used elsewhere, or keep it.
import { FavoriteButton } from '@/components/ui/favorite-button';
import { cn, normalizeImageUrl } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const productUrl = product.slug
        ? `/produtos/${product.slug}`
        : `/produtos/${product.id}`;

    // Logic to get hover image if available
    const mainImage = normalizeImageUrl(product.images?.[0]?.url);
    const hoverImage = normalizeImageUrl(product.images?.[1]?.url || product.images?.[0]?.url);

    const displayPrice = product.preco_promocional || product.price;

    return (
        <div className="group relative fade-in flex flex-col h-full">
            {/* Image Container */}
            <Link href={productUrl} className="block relative aspect-[3/4] bg-off-white overflow-hidden mb-4">
                {mainImage ? (
                    <>
                        {/* Main Image */}
                        <Image
                            src={mainImage || '/placeholder-jewelry.webp'}
                            alt={product.name}
                            fill
                            className="object-cover transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:opacity-0"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            unoptimized
                        />
                        {/* Hover Image */}
                        <Image
                            src={hoverImage || mainImage || '/placeholder-jewelry.webp'}
                            alt={product.name}
                            fill
                            className="object-cover absolute inset-0 transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            unoptimized
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-medium-gray bg-light-gray/20">
                        <span className="font-inter text-xs tracking-widest uppercase">Sem Imagem</span>
                    </div>
                )}

                {/* Badges */}
                {product.preco_promocional && product.current_stock > 0 && (
                    <span className="absolute top-3 left-0 bg-primary-gold text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1">
                        Promoção
                    </span>
                )}
                {product.current_stock <= 0 && (
                    <span className="absolute top-3 left-0 bg-zinc-500 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1">
                        Esgotado
                    </span>
                )}

                {/* Overlay Action */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex justify-center pb-6">
                    {product.current_stock > 0 ? (
                        <button className="w-full bg-white/95 backdrop-blur-sm text-deep-black font-montserrat text-xs uppercase tracking-widest py-3 hover:bg-deep-black hover:text-white transition-colors">
                            Ver Detalhes
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                                if (token) {
                                    // Logado: Salva e vai para o painel
                                    const userId = Number(JSON.parse(atob(token.split('.')[1])).sub);
                                    axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/stock-notifications`, {
                                        email: 'user-logged-in', // O backend deve preferir o user_id se presente
                                        product_id: product.id,
                                        user_id: userId
                                    }, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    }).then(() => {
                                        window.location.href = '/minha-conta/avisos-estoque';
                                    }).catch(err => {
                                        console.error('Erro ao registrar:', err);
                                        window.location.href = '/minha-conta/avisos-estoque';
                                    });
                                } else {
                                    // Não logado: Salva pendente e vai para login
                                    localStorage.setItem('pending_stock_alert', JSON.stringify({
                                        product_id: product.id
                                    }));
                                    window.location.href = '/login?redirect=/minha-conta/avisos-estoque';
                                }
                            }}
                            className="w-full bg-primary-gold/90 backdrop-blur-sm text-white font-montserrat text-xs uppercase tracking-widest py-3 hover:bg-primary-gold transition-colors"
                        >
                            Avise-me
                        </button>
                    )}
                </div>

                {/* Top Right Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-10">
                    <FavoriteButton productId={product.id} />
                </div>
            </Link>

            {/* Product Info */}
            <div className="space-y-2 text-center flex-1 flex flex-col justify-end pb-2">
                <Link href={productUrl}>
                    <h3 className="font-montserrat text-xs md:text-sm text-deep-black font-medium tracking-wide group-hover:text-primary-gold transition-colors line-clamp-2 uppercase h-10 flex items-center justify-center">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center justify-center gap-3">
                    {product.current_stock > 0 ? (
                        product.preco_promocional ? (
                            <>
                                <span className="font-poppins text-xs text-medium-gray line-through decoration-1">
                                    {formatCurrency(product.price)}
                                </span>
                                <span className="font-poppins text-sm font-semibold text-primary-gold">
                                    {formatCurrency(product.preco_promocional)}
                                </span>
                            </>
                        ) : (
                            <span className="font-poppins text-sm font-semibold text-deep-black">
                                {formatCurrency(product.price)}
                            </span>
                        )
                    ) : (
                        <div className="space-y-1">
                            {product.price > 0 && (
                                <span className="block font-poppins text-xs text-medium-gray line-through">
                                    {formatCurrency(product.price)}
                                </span>
                            )}
                            <span className="block font-montserrat text-[10px] uppercase tracking-widest font-bold text-red-500">
                                Produto Indisponível
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
