'use client';

import { Category } from '@/lib/services/categories.service';
import { CategoryCard } from './CategoryCard';
import { Carousel } from './Carousel';

interface CategoryCarouselProps {
    categories: Category[];
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <Carousel
            title="Categorias"
            subtitle="Explore nossas coleções exclusivas por categoria"
        >
            {categories.map((cat) => (
                <CategoryCard
                    key={cat.id}
                    name={cat.name}
                    slug={cat.slug || ''}
                    imageUrl={cat.image_url || '/placeholder-jewelry.webp'}
                />
            ))}
        </Carousel>
    );
}
