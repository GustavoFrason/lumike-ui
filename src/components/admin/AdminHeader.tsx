'use client';

import { LogOut, Bell, Menu } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

/**
 * Cabeçalho fixo do painel.
 * Mostra logo, breadcrumb, notificações e botão de logout.
 */
export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="print:hidden flex flex-col bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Botão menu mobile */}
        <button className="md:hidden p-2 rounded-md hover:bg-gray-100" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-playfair font-bold tracking-wide text-gray-800">
            Lumilee
          </span>
          <span className="text-lg font-semibold text-gray-800 hidden md:block">
            Painel Lumilee
          </span>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>

          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-md text-sm hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </form>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-2 border-t bg-[var(--lumilee-beige)]">
        <Breadcrumb />
      </div>
    </header>
  );
}
