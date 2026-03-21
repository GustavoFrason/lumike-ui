'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  X,
  LayoutDashboard,
  Diamond,
  ShoppingBag,
  Users,
  Shield,
  Tag,
  FolderOpen,
  Package,
  QrCode,
  Settings,
  BarChart3,
  Truck,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar do painel Lumike.
 * Responsiva e animada (abre/fecha no mobile).
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/admin/produtos', label: 'Produtos', icon: <Diamond size={18} /> },
    { href: '/admin/produtos/etiquetas', label: 'Etiquetas QR', icon: <QrCode size={18} /> },
    { href: '/admin/categorias', label: 'Categorias', icon: <Tag size={18} /> },
    { href: '/admin/colecoes', label: 'Coleções', icon: <FolderOpen size={18} /> },
    { href: '/admin/estoque', label: 'Estoque', icon: <Package size={18} /> },
    { href: '/admin/vendas', label: 'Pedidos', icon: <ShoppingBag size={18} /> },
    { href: '/admin/clientes', label: 'Clientes', icon: <Users size={18} /> },
    { href: '/admin/compras-acessorios', label: 'Insumos', icon: <Package size={18} /> },
    { href: '/admin/fornecedores', label: 'Fornecedores', icon: <Truck size={18} /> },
    { href: '/admin/compras', label: 'Entrada de Estoque', icon: <ShoppingCart size={18} /> },
    { href: '/admin/analise-roi', label: 'Análise ROI', icon: <TrendingUp size={18} /> },
    { href: '/admin/clientes-pagar', label: 'A Receber (Boca)', icon: <ShoppingBag size={18} /> },
    { href: '/admin/fluxo-caixa', label: 'Fluxo de Caixa', icon: <BarChart3 size={18} /> },
    { href: '/admin/garantias', label: 'Garantias', icon: <Shield size={18} /> },
    { href: '/admin/configuracoes', label: 'Configurações', icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm">
        <div className="p-6 text-lg font-semibold text-(--lumike-gold)">Menu Administrativo</div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-(--lumike-beige) transition"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay escuro */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Painel lateral */}
            <motion.aside
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold text-(--lumike-gold)">Menu</span>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-(--lumike-beige) transition"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
