'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { normalizeImageUrl } from '@/lib/utils';

interface CategoryCardProps {
    name: string;
    slug: string;
    imageUrl: string;
}


export function CategoryCard({ name, slug, imageUrl }: CategoryCardProps) {
    const normalizedImage = normalizeImageUrl(imageUrl);

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative group overflow-hidden rounded-sm aspect-[4/5] bg-zinc-100 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        >
            <Link href={`/?category=${slug}`} className="block w-full h-full relative">
                <Image
                    src={normalizedImage || '/placeholder-jewelry.webp'}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

                {/* Title */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <h3 className="text-white font-playfair text-xl md:text-2xl font-bold tracking-[0.2em] uppercase text-center drop-shadow-lg">
                        {name}
                    </h3>
                </div>
            </Link>
        </motion.div>
    );
}
