'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface WhatsAppWidgetProps {
  phone?: string;
  message?: string;
}

export function WhatsAppWidget({
  phone = '5511999999999', // Default phone
  message = 'Olá! Gostaria de saber mais sobre as semijoias Lumike.',
}: WhatsAppWidgetProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-50 p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
      aria-label="Falar conosco no WhatsApp"
    >
      <MessageCircle size={28} />
      <span className="absolute right-full mr-3 bg-white text-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        Precisa de ajuda?
      </span>
    </motion.button>
  );
}
