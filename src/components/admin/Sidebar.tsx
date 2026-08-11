'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  X,
  LayoutDashboard,
  Diamond,
  Users,
  ShieldCheck,
  Tag,
  FolderOpen,
  Package,
  QrCode,
  Settings,
  BarChart3,
  Truck,
  ShoppingCart,
  TrendingUp,
  PlusCircle,
  History,
  Wallet,
  BadgePercent,
  Component,
  UserCog
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
  const menuGroups = [
    {
      label: 'Geral',
      items: [
        { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      ]
    },
    {
      label: 'Operações (PDV)',
      items: [
        { href: '/admin/vendas/nova', label: 'Nova Venda', icon: <PlusCircle size={18} /> },
        { href: '/admin/vendas', label: 'Histórico de Pedidos', icon: <History size={18} /> },
        { href: '/admin/clientes', label: 'Clientes (CRM)', icon: <Users size={18} /> },
        { href: '/admin/garantias', label: 'Garantias', icon: <ShieldCheck size={18} /> },
      ]
    },
    {
      label: 'Inventário & Catálogo',
      items: [
        { href: '/admin/estoque', label: 'Controle de Estoque', icon: <Package size={18} /> },
        { href: '/admin/produtos', label: 'Produtos', icon: <Diamond size={18} /> },
        { href: '/admin/produtos/etiquetas', label: 'Etiquetas QR', icon: <QrCode size={18} /> },
        { href: '/admin/categorias', label: 'Categorias', icon: <Tag size={18} /> },
        { href: '/admin/colecoes', label: 'Coleções', icon: <FolderOpen size={18} /> },
      ]
    },
    {
      label: 'Suprimentos',
      items: [
        { href: '/admin/compras', label: 'Entrada (Lotes)', icon: <ShoppingCart size={18} /> },
        { href: '/admin/fornecedores', label: 'Fornecedores', icon: <Truck size={18} /> },
        { href: '/admin/compras-acessorios', label: 'Insumos / Acessórios', icon: <Component size={18} /> },
      ]
    },
    {
      label: 'Financeiro & BI',
      items: [
        { href: '/admin/fluxo-caixa', label: 'Fluxo de Caixa', icon: <BarChart3 size={18} /> },
        { href: '/admin/clientes-pagar', label: 'Contas a Receber', icon: <Wallet size={18} /> },
        { href: '/admin/comissoes', label: 'Comissões', icon: <BadgePercent size={18} /> },
        { href: '/admin/analise-roi', label: 'Análise de ROI', icon: <TrendingUp size={18} /> },
      ]
    },
    {
      label: 'Administração',
      items: [
        { href: '/admin/usuarios', label: 'Usuários / Equipe', icon: <UserCog size={18} /> },
        { href: '/admin/configuracoes', label: 'Configurações', icon: <Settings size={18} /> },
      ]
    }
  ];

  const renderNav = (mobile = false) => (
    <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
      {menuGroups.map((group) => (
        <div key={group.label} className="space-y-2">
          <h3 className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {group.label}
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={mobile ? onClose : undefined}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-600 hover:text-(--lumike-gold) hover:bg-orange-50/50 transition-all border border-transparent hover:border-orange-100 group"
              >
                <span className="text-zinc-400 group-hover:text-(--lumike-gold) transition-colors">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-xs h-screen sticky top-0 overflow-hidden">
        <div className="p-8 pb-4">
          <div className="text-xl font-serif font-bold tracking-tight text-zinc-900 italic">
            LUMIKE <span className="text-(--lumike-gold) not-italic font-sans text-xs align-top ml-1">ADMIN</span>
          </div>
        </div>
        {renderNav()}
      </aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-50">
                <span className="font-serif font-bold text-zinc-900 tracking-tight italic">LUMIKE</span>
                <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
                  <X size={20} />
                </button>
              </div>

              {renderNav(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
