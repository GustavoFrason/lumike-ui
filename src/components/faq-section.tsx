'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'As semijoias Lumike têm garantia?',
    answer:
      'Sim! Todas as nossas peças possuem garantia de 1 ano no banho. Cada pedido acompanha um certificado de garantia detalhado.',
  },
  {
    question: 'Qual o prazo de entrega?',
    answer:
      'O prazo varia de acordo com sua região. Para Curitiba e RMC, temos a opção de retirada em até 3 horas. Para o restante do Brasil, o prazo médio é de 3 a 10 dias úteis.',
  },
  {
    question: 'Como cuidar das minhas peças?',
    answer:
      'Para manter o brilho, evite contato com perfumes, cremes e produtos químicos. Após o uso, limpe suavemente com uma flanela seca.',
  },
  {
    question: 'Posso trocar meu produto?',
    answer:
      'Com certeza. Você tem até 7 dias após o recebimento para solicitar a troca ou devolução, desde que a peça esteja sem sinais de uso.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white/50 backdrop-blur-sm relative z-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-playfair font-bold text-zinc-900 mb-4 uppercase tracking-[0.2em]">
            Dúvidas Frequentes
          </h2>
          <p className="text-zinc-500 font-inter text-sm italic">
            Tudo o que você precisa saber para comprar com segurança
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-zinc-100 last:border-0">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 flex items-center justify-between text-left group transition-all"
              >
                <span
                  className={`text-lg font-playfair transition-colors duration-300 ${openIndex === index ? 'text-primary-gold' : 'text-zinc-800'}`}
                >
                  {faq.question}
                </span>
                <span className="p-1 rounded-full bg-zinc-50 group-hover:bg-zinc-100 transition-colors">
                  {openIndex === index ? (
                    <Minus className="w-4 h-4 text-primary-gold" />
                  ) : (
                    <Plus className="w-4 h-4 text-zinc-400" />
                  )}
                </span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-zinc-600 font-inter leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
