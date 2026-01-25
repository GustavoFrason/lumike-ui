'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface HomeHeroProps {
    title: string;
    subtitle: string;
    imageUrl?: string;
}

export function HomeHero({ title, subtitle, imageUrl }: HomeHeroProps) {
    const bgImage = imageUrl || '/images/hero-bg.jpg'; // Fallback if no image

    return (
        <div className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
            {/* Background Image with Parallax-like or static fixed effect */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    // Parallax effect can be complex, sticking to simple cover for now or fixed
                    backgroundAttachment: 'fixed'
                }}
            >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white space-y-8">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="font-playfair text-5xl md:text-7xl font-medium tracking-tight"
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="font-inter text-lg md:text-xl font-light opacity-90 leading-relaxed max-w-2xl mx-auto"
                >
                    {subtitle}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <Link
                        href="/colecoes"
                        className="inline-block bg-primary-gold text-deep-black font-montserrat font-medium text-sm tracking-widest uppercase px-10 py-4 hover:bg-white hover:scale-105 transition-all duration-300 shadow-luxury"
                    >
                        Descobrir Coleção
                    </Link>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent opacity-50" />
            </motion.div>
        </div>
    );
}
