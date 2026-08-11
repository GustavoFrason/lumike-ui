import { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/services/products.service';

export type ProductInfoTab = 'description' | 'shipping' | 'warranty';

interface ProductInfoTabsProps {
  product: Product;
  activeTab: ProductInfoTab;
  onTabChange: (tab: ProductInfoTab) => void;
  tabsRef: RefObject<HTMLDivElement | null>;
}

export function ProductInfoTabs({
  product,
  activeTab,
  onTabChange,
  tabsRef,
}: ProductInfoTabsProps) {
  return (
    <div ref={tabsRef} className="mt-12 scroll-mt-24">
      <div className="flex border-b border-light-gray">
        {(['description', 'warranty', 'shipping'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              'flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all relative',
              activeTab === tab ? 'text-primary-gold' : 'text-medium-gray hover:text-deep-black',
            )}
          >
            {tab === 'description' && 'Detalhes'}
            {tab === 'warranty' && 'Garantia'}
            {tab === 'shipping' && 'Envio'}
            {activeTab === tab && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-gold"
              />
            )}
          </button>
        ))}
      </div>

      <div className="py-6 min-h-[150px] font-inter text-sm text-zinc-600 leading-relaxed">
        <AnimatePresence mode="wait">
          {activeTab === 'description' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="whitespace-pre-line"
            >
              {product.description || 'Sem descrição detalhada.'}
              {product.sku && <p className="mt-4 text-xs text-medium-gray">REF: {product.sku}</p>}
            </motion.div>
          )}
          {activeTab === 'warranty' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="mb-4">
                Todas as nossas peças possuem garantia vitalícia quanto à autenticidade dos
                materiais e 1 ano de garantia contra defeitos de fabricação e banho.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Não cobrimos mau uso, quebras ou perda de pedras por queda.</li>
                <li>Evite contato com produtos químicos, mar e piscina para maior durabilidade.</li>
              </ul>
            </motion.div>
          )}
          {activeTab === 'shipping' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="mb-4">
                Enviamos para todo o Brasil via Correios (PAC/Sedex). O prazo de postagem é de até 2
                dias úteis após a confirmação do pagamento.
              </p>
              <p>Frete grátis para compras acima de R$ 399,00.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
