'use client';

import { useRef, useState } from 'react';
import { Product } from '@/lib/services/products.service';
import { formatCurrency } from '@/lib/formatters';
import { Heart, Share2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ProductImageGallery } from './product-details/ProductImageGallery';
import { PurchaseCta } from './product-details/PurchaseCta';
import { ProductInfoTabs, ProductInfoTab } from './product-details/ProductInfoTabs';
// Optionally disable global one here? No, keep it.

interface ProductDetailsProps {
  product: Product;
  images: string[];
}

export function ProductDetails({ product, images }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState<string>(images[0] || '');
  const [activeTab, setActiveTab] = useState<ProductInfoTab>('description');
  const tabsRef = useRef<HTMLDivElement>(null);

  function handleReadAll() {
    // "description" já é a aba padrão — só trocar o state não muda nada
    // visível se o usuário nunca saiu dela. Precisa rolar até a seção.
    setActiveTab('description');
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const displayPrice = product.preco_promocional || product.price;

  return (
    <div className="bg-off-white min-h-screen py-12">
      <div className="container mx-auto px-6 md:px-12">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-medium-gray mb-8 font-inter">
          <Link href="/" className="hover:text-primary-gold transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/colecoes" className="hover:text-primary-gold transition-colors">
            Coleções
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-deep-black font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <ProductImageGallery
            product={product}
            images={images}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
          />

          {/* Right Column: Info */}
          <div className="space-y-8 sticky top-24 h-fit">
            <div className="space-y-4">
              <h1 className="font-playfair text-4xl md:text-5xl text-deep-black leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-4">
                  <span className="font-poppins text-3xl font-medium text-primary-gold">
                    {formatCurrency(displayPrice)}
                  </span>
                  {product.preco_promocional && (
                    <span className="font-inter text-lg text-medium-gray line-through decoration-1">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
                {/* Actions */}
                <div className="flex gap-4">
                  <button className="text-medium-gray hover:text-rose-gold transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="text-medium-gray hover:text-deep-black transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-px bg-light-gray w-full" />

            {/* Description Short */}
            <p className="font-inter text-medium-gray leading-relaxed text-sm">
              {product.description?.slice(0, 150)}...
              <button
                onClick={handleReadAll}
                className="text-deep-black underline ml-2 text-xs font-bold uppercase tracking-wider"
              >
                Ler tudo
              </button>
            </p>

            <PurchaseCta product={product} />

            <ProductInfoTabs
              product={product}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabsRef={tabsRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
