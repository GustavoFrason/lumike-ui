'use client';

import { Card } from '@/components/ui/card';
import { Ticket, ShoppingBag, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-playfair text-3xl font-bold mb-2">Visão Geral</h1>
                <p className="text-medium-gray text-sm">Bem-vindo(a) de volta ao seu espaço exclusivo Lumike.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white border border-light-gray hover:border-primary-gold transition-colors cursor-pointer group">
                    <Link href="/minha-conta/pedidos">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <span className="text-4xl font-playfair font-bold text-deep-black group-hover:text-primary-gold transition-colors">0</span>
                        </div>
                        <h3 className="font-medium text-deep-black">Pedidos Recentes</h3>
                        <p className="text-xs text-medium-gray mt-1">Acompanhe suas entregas</p>
                    </Link>
                </Card>

                <Card className="p-6 bg-white border border-light-gray hover:border-primary-gold transition-colors cursor-pointer group">
                    <Link href="/minha-conta/wallet">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-full">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <span className="text-4xl font-playfair font-bold text-deep-black group-hover:text-primary-gold transition-colors">1</span>
                        </div>
                        <h3 className="font-medium text-deep-black">Cupons Ativos</h3>
                        <p className="text-xs text-medium-gray mt-1">Descontos disponíveis</p>
                    </Link>
                </Card>

                <Card className="p-6 bg-white border border-light-gray hover:border-primary-gold transition-colors cursor-pointer group">
                    <Link href="/minha-conta/garantias">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="text-4xl font-playfair font-bold text-deep-black group-hover:text-primary-gold transition-colors">0</span>
                        </div>
                        <h3 className="font-medium text-deep-black">Garantias</h3>
                        <p className="text-xs text-medium-gray mt-1">Certificados digitais</p>
                    </Link>
                </Card>

                <Card className="p-6 bg-white border border-light-gray hover:border-primary-gold transition-colors cursor-pointer group">
                    <Link href="/minha-conta/favoritos">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-full">
                                <Heart className="w-6 h-6" />
                            </div>
                            {/* <span className="text-4xl font-playfair font-bold text-deep-black group-hover:text-primary-gold transition-colors">-</span> */}
                        </div>
                        <h3 className="font-medium text-deep-black">Lista de Desejos</h3>
                        <p className="text-xs text-medium-gray mt-1">Seus favoritos</p>
                    </Link>
                </Card>
            </div>

            <div className="bg-primary-gold/5 p-6 border border-primary-gold/20 rounded-sm">
                <h3 className="font-playfair text-xl font-bold mb-2">Novidade Exclusiva</h3>
                <p className="text-sm text-deep-black mb-4">
                    Como cliente VIP, você tem acesso antecipado à nova coleção de Inverno.
                </p>
                <button className="bg-deep-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary-gold transition-colors">
                    Ver Coleção
                </button>
            </div>
        </div>
    );
}
