'use client';

import { Product } from '@/lib/services/products.service';
import { ProductCard } from './product-card';
import { Carousel } from './Carousel';

interface ProductCarouselProps {
  title?: string;
  subtitle?: string;
  products: Product[];
}

export function ProductCarousel({
  title = 'Destaques',
  subtitle = 'Nossas peças mais desejadas selecionadas para você',
  products,
}: ProductCarouselProps) {
  if (!products || products.length === 0) return null;

  return (
    <Carousel title={title} subtitle={subtitle}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Carousel>
  );
}
