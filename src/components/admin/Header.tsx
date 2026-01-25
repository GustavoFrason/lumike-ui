'use client';

import { Menu } from 'lucide-react';

/**
 * Header.tsx
 * ------------------------------------------------
 * Cabeçalho fixo do painel admin.
 * Mostra o botão de menu no mobile e botão de sair.
 */
export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Ícone do menu (mobile) */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-semibold text-[#C6A664] tracking-wide">
          Lumike Admin
        </h1>
      </div>

      <form action="/api/logout" method="POST">
        <button
          type="submit"
          className="text-sm font-medium text-gray-700 hover:text-red-600 transition"
        >
          Sair
        </button>
      </form>
    </header>
  );
}