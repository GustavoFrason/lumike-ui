'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { User, ShoppingBag, ShieldCheck, Ticket, Heart, LogOut, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
            router.replace('/login');
            // Opcional: recarregar para limpar estados globais se necessário
            window.location.href = '/login';
        } catch (error) {
            console.error('Erro ao sair:', error);
            // Fallback se a API falhar (mesmo que não deva)
            document.cookie = 'lumike_token=; Max-Age=0; path=/;';
            window.location.href = '/login';
        }
    };

    const menuItems = [
        { title: 'Visão Geral', href: '/minha-conta', icon: User },
        { title: 'Meus Pedidos', href: '/minha-conta/pedidos', icon: ShoppingBag },
        { title: 'Minhas Garantias', href: '/minha-conta/garantias', icon: ShieldCheck },
        { title: 'Wallet & Cupons', href: '/minha-conta/wallet', icon: Ticket },
        { title: 'Favoritos', href: '/minha-conta/favoritos', icon: Heart },
        { title: 'Avisos de Estoque', href: '/minha-conta/avisos-estoque', icon: Bell },
    ];

    return (
        <div className="container mx-auto px-6 md:px-12 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Sidebar */}
                <aside className="space-y-6">
                    <div className="bg-white p-6 border border-light-gray">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-gold/10 rounded-full flex items-center justify-center text-primary-gold">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-medium-gray font-bold uppercase tracking-widest">Olá,</p>
                                    <p className="font-playfair text-lg font-bold">Cliente VIP</p>
                                </div>
                            </div>

                            {/* Notification Bell */}
                            <Link href="/minha-conta/avisos-estoque" className="relative p-2 text-medium-gray hover:text-primary-gold transition-colors">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </Link>
                        </div>

                        <nav className="space-y-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-off-white text-primary-gold border-r-2 border-primary-gold"
                                                : "text-medium-gray hover:text-deep-black hover:bg-gray-50"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="pt-4 mt-4 border-t border-light-gray">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Sair
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <div className="md:col-span-3">
                    {children}
                </div>
            </div>
        </div>
    );
}
