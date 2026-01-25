'use client';

import { Truck, Gem, CreditCard, Package, TicketPercent, ShieldCheck } from 'lucide-react';

export function BenefitsBar() {
    const benefits = [
        {
            icon: Truck,
            title: 'Frete Grátis Para Todo Brasil',
            subtitle: 'acima de R$ 199'
        },
        {
            icon: TicketPercent, // Or Gem if preferred for 'Discount'
            title: 'Ganhe 5% de Desconto',
            subtitle: 'no PIX pagamento à vista'
        },
        {
            icon: CreditCard,
            title: 'Até 6X Sem Juros',
            subtitle: 'parcela mínima de R$ 50'
        },
        {
            icon: Package,
            title: 'Retire Fácil em Curitiba e RMC',
            subtitle: 'até 3 Horas em Dias Úteis'
        },
        // Adding a 5th one based on image if needed, or sticking to 4 for grid balance. 
        // Image shows 5 items: Frete, 5% Desc, 6x Sem Juros, Retire Facil, Entrega RP
        {
            icon: ShieldCheck, // Using Truck again for local delivery, or differnt icon
            title: 'Garantia de 1 ano',
            subtitle: 'em todas as'
        }
    ];

    return (
        <div className="w-full bg-white/90 backdrop-blur-md border-b border-light-gray py-10 relative z-30">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 items-start justify-items-center text-center lg:text-left lg:justify-items-start">
                    {benefits.map((item, idx) => (
                        <div key={idx} className="flex flex-col lg:flex-row items-center lg:items-start gap-4 group cursor-default">
                            <div className="p-3 rounded-full border border-light-gray group-hover:border-primary-gold group-hover:bg-primary-gold/5 transition-colors duration-300">
                                <item.icon className="w-6 h-6 text-primary-gold" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-montserrat text-sm font-bold text-deep-black uppercase tracking-wide">
                                    {item.title}
                                </h3>
                                <p className="font-inter text-xs text-medium-gray">
                                    {item.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
