'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { User, Search, Menu, X, Heart, ShoppingBag } from 'lucide-react'; // Restored ShoppingBag for layout balance even if link is hidden/changed
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug?: string;
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(2000);

  const pathname = usePathname();
  const router = useRouter();

  // Fetch Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await api.get<Category[]>('/categorias?is_active=true');
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch Settings (Free Shipping)
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await api.get<{ key: string; value: string }>(
          '/settings/free_shipping_threshold',
        );
        if (data && data.value) {
          setFreeShippingThreshold(parseFloat(data.value));
        }
      } catch (err) {
        // Silent error, use default
        console.warn('Failed to load free shipping threshold, using fallback.');
      }
    }
    fetchSettings();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className="w-full bg-white z-50 border-b border-light-gray flex flex-col relative">
        {/* 1. Top Bar */}
        <div className="bg-deep-black text-white text-[10px] md:text-xs py-2 text-center font-montserrat tracking-widest uppercase">
          Frete grátis via PAC para todo o Brasil a partir de{' '}
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            freeShippingThreshold,
          )}
        </div>

        <div className="container mx-auto px-6 md:px-12 flex flex-col">
          {/* 2. Main Header: Logo & Icons */}
          <div className="flex items-center justify-between py-6 relative">
            {/* Mobile Menu Trigger (Left) */}
            <button className="md:hidden text-deep-black" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo (Center) */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <Link href="/" className="group">
                <h1 className="font-playfair font-bold text-3xl md:text-4xl text-deep-black tracking-tight">
                  Lumilee<span className="text-primary-gold">.</span>
                </h1>
              </Link>
            </div>

            {/* Icons (Right) */}
            <div className="flex items-center gap-5 ml-auto text-deep-black">
              {/* Desktop Search Trigger */}
              <div className="hidden md:flex items-center relative">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={handleSearchSubmit}
                      className="mr-2 overflow-hidden"
                    >
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="BUSCAR..."
                        className="w-full bg-transparent border-b border-deep-black focus:outline-none text-xs py-1 font-montserrat uppercase tracking-wider placeholder:text-medium-gray"
                        autoFocus
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="hover:text-primary-gold transition-colors"
                >
                  {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                </button>
              </div>

              <Link href="/login" className="hover:text-primary-gold transition-colors">
                <User className="w-5 h-5" />
              </Link>

              <button className="hover:text-primary-gold transition-colors relative">
                <Heart className="w-5 h-5" />
              </button>

              <div className="hidden md:flex items-center gap-1 text-xs font-medium relative">
                <ShoppingBag className="w-5 h-5 cursor-not-allowed opacity-50" />
                <span className="text-[10px] absolute -top-1 -right-1 bg-medium-gray text-white w-3 h-3 flex items-center justify-center rounded-full">
                  0
                </span>
              </div>
            </div>
          </div>

          {/* 3. Navigation Bar (Desktop Only) */}
          <nav className="hidden md:flex items-center justify-center gap-8 pb-5 border-t border-transparent">
            {/* Static Links */}
            <Link
              href="/novidades"
              className="text-xs font-montserrat font-medium uppercase tracking-widest hover:text-primary-gold transition-colors"
            >
              Lançamentos
            </Link>
            <Link
              href="/colecoes"
              className="text-xs font-montserrat font-medium uppercase tracking-widest hover:text-primary-gold transition-colors"
            >
              Coleções
            </Link>

            {/* Dynamic Categories */}
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.id}`}
                className="text-xs font-montserrat font-medium uppercase tracking-widest hover:text-primary-gold transition-colors"
              >
                {cat.name}
              </Link>
            ))}

            <Link
              href="/bestsellers"
              className="text-xs font-montserrat font-bold text-primary-gold uppercase tracking-widest hover:text-deep-black transition-colors"
            >
              Mais Vendidos
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-light-gray">
                <h2 className="font-playfair text-xl font-bold">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-light-gray rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-6 pb-0">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="w-full bg-off-white border border-light-gray py-2 pl-3 pr-10 text-sm outline-none focus:border-primary-gold"
                  />
                  <button type="submit" className="absolute right-2 top-2 text-medium-gray">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <Link
                  href="/"
                  className="block font-montserrat text-sm font-bold uppercase tracking-widest text-deep-black"
                >
                  Home
                </Link>
                <Link
                  href="/colecoes"
                  className="block font-montserrat text-sm font-bold uppercase tracking-widest text-deep-black"
                >
                  Coleções
                </Link>

                <div className="space-y-3">
                  <p className="text-xs text-medium-gray font-bold uppercase tracking-widest">
                    Categorias
                  </p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/?category=${cat.id}`}
                      className="block font-montserrat text-sm text-zinc-600 hover:text-primary-gold pl-2 border-l-2 border-transparent hover:border-primary-gold transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-6 border-t border-light-gray space-y-4">
                  <Link
                    href="/login"
                    className="flex items-center gap-3 text-sm font-medium text-deep-black"
                  >
                    <User className="w-5 h-5" /> Minha Conta
                  </Link>
                  <div className="flex items-center gap-3 text-sm font-medium text-deep-black opacity-50">
                    <ShoppingBag className="w-5 h-5" /> Carrinho (0)
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
