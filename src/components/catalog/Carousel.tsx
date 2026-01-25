'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode[];
    itemsPerPage?: {
        mobile: number;
        tablet: number;
        desktop: number;
    };
}

export function Carousel({ title, subtitle, children, itemsPerPage = { mobile: 2, tablet: 3, desktop: 4 } }: CarouselProps) {
    const [index, setIndex] = useState(0);
    const [itemsToShow, setItemsToShow] = useState(itemsPerPage.desktop);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setItemsToShow(itemsPerPage.mobile);
            else if (window.innerWidth < 1024) setItemsToShow(itemsPerPage.tablet);
            else setItemsToShow(itemsPerPage.desktop);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [itemsPerPage]);

    const maxIndex = Math.max(0, children.length - itemsToShow);

    const next = () => {
        setIndex((prev) => Math.min(prev + 1, maxIndex));
    };

    const prev = () => {
        setIndex((prev) => Math.max(prev - 1, 0));
    };

    return (
        <section className="py-12">
            {(title || subtitle) && (
                <div className="mb-8 text-center px-6">
                    {title && <h2 className="text-3xl font-playfair font-bold text-zinc-900 mb-2 uppercase tracking-widest">{title}</h2>}
                    {subtitle && <p className="text-zinc-500 font-inter text-sm max-w-xl mx-auto">{subtitle}</p>}
                </div>
            )}

            <div className="relative group px-12 md:px-16 overflow-hidden">
                {/* Buttons */}
                <button
                    onClick={prev}
                    disabled={index === 0}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/80 rounded-full shadow-md text-zinc-900 transition-all hover:bg-white disabled:opacity-0 disabled:pointer-events-none group-hover:opacity-100 ${index === 0 ? 'opacity-0' : 'md:opacity-0'}`}
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                    onClick={next}
                    disabled={index >= maxIndex}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/80 rounded-full shadow-md text-zinc-900 transition-all hover:bg-white disabled:opacity-0 disabled:pointer-events-none group-hover:opacity-100 ${index >= maxIndex ? 'opacity-0' : 'md:opacity-0'}`}
                >
                    <ChevronRight className="h-6 w-6" />
                </button>

                {/* Viewport */}
                <div className="overflow-hidden" ref={containerRef}>
                    <motion.div
                        className="flex"
                        animate={{ x: `-${(index * (100 / itemsToShow))}%` }}
                        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                    >
                        {children.map((child, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 px-3"
                                style={{ width: `${100 / itemsToShow}%` }}
                            >
                                {child}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
