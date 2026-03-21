'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AdminHeader } from './AdminHeader';
import { ReactNode } from 'react';

/**
 * Estrutura principal do painel administrativo.
 * Responsável por controlar a sidebar (aberta/fechada) no mobile.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--lumike-beige)] text-[var(--lumike-text)]">
      {/* Sidebar lateral */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Container principal */}
        <main className="flex-1 p-6 md:p-10 bg-[var(--lumike-bg)] rounded-t-xl shadow-inner overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
