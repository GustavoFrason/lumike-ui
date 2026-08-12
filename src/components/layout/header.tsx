'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[var(--lumilee-taupe)] text-white shadow-md py-3'
          : 'bg-transparent text-[var(--lumilee-taupe)] py-6'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Mobile Menu */}
        <button className="md:hidden">
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center text-center mx-auto md:mx-0">
          <Link href="/" className="group">
            <h1
              className={`font-serif tracking-widest uppercase transition-all duration-300 ${
                isScrolled ? 'text-xl' : 'text-3xl'
              }`}
            >
              Lumilee
            </h1>
            <span
              className={`text-[0.6rem] tracking-[0.3em] uppercase block opacity-80 group-hover:opacity-100 transition-opacity ${
                isScrolled ? 'hidden' : 'block'
              }`}
            >
              Semijoias
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium hover:opacity-75 uppercase tracking-widest text-[0.7rem]"
          >
            Home
          </Link>
          <Link
            href="/?category=lancamentos"
            className="text-sm font-medium hover:opacity-75 uppercase tracking-widest text-[0.7rem]"
          >
            Lançamentos
          </Link>
          <Link
            href="/?category=aneis"
            className="text-sm font-medium hover:opacity-75 uppercase tracking-widest text-[0.7rem]"
          >
            Anéis
          </Link>
          <Link
            href="/?category=colares"
            className="text-sm font-medium hover:opacity-75 uppercase tracking-widest text-[0.7rem]"
          >
            Colares
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button className="hover:opacity-75 transition">
            <Search className="h-5 w-5" />
          </button>
          <button className="hover:opacity-75 transition relative">
            <ShoppingBag className="h-5 w-5" />
            {/* Badge example */}
            <span className="absolute -top-1 -right-1 bg-[var(--lumilee-gold)] text-white text-[0.6rem] w-3 h-3 flex items-center justify-center rounded-full">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
