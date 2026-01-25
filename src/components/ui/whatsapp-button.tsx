'use client';

import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
    productName: string;
    className?: string;
    variant?: 'icon' | 'full';
}

export function WhatsAppButton({ productName, className, variant = 'icon' }: WhatsAppButtonProps) {
    const phoneNumber = '5511999999999'; // TODO: Tornar configurável via env ou settings
    const message = encodeURIComponent(`Olá! Gostaria de mais informações sobre o produto: ${productName}`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Evita navegar para o detalhe do produto ao clicar no botão
        window.open(whatsappUrl, '_blank');
    };

    if (variant === 'full') {
        return (
            <button
                onClick={handleClick}
                className={cn(
                    "w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-200",
                    className
                )}
            >
                <MessageCircle className="h-5 w-5" />
                Pedir no WhatsApp
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                "p-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10",
                className
            )}
            title="Pedir no WhatsApp"
        >
            <MessageCircle className="h-5 w-5" />
        </button>
    );
}
