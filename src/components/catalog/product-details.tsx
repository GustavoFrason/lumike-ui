'use client';

import { useState } from 'react';
import axios from 'axios';
import { Product } from '@/lib/services/products.service';
import { formatCurrency } from '@/lib/formatters';
import Image from 'next/image';
import { Truck, ShieldCheck, Heart, Share2, ChevronRight } from 'lucide-react';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { FloatingWhatsApp } from '@/components/ui/floating-whatsapp'; // Optionally disable global one here? No, keep it.

interface ProductDetailsProps {
  product: Product;
  images: string[];
}

export function ProductDetails({ product, images }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState<string>(images[0] || '');
  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'warranty'>(
    'description',
  );

  const displayPrice = product.preco_promocional || product.price;

  return (
    <div className="bg-off-white min-h-screen py-12">
      <div className="container mx-auto px-6 md:px-12">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-medium-gray mb-8 font-inter">
          <Link href="/" className="hover:text-primary-gold transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/colecoes" className="hover:text-primary-gold transition-colors">
            Coleções
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-deep-black font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column: Gallery */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-[3/4] bg-white rounded-sm overflow-hidden shadow-sm group cursor-zoom-in"
            >
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-150"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-medium-gray bg-light-gray/20">
                  <span className="font-inter text-xs tracking-widest uppercase">Sem Imagem</span>
                </div>
              )}
              {product.preco_promocional && (
                <span className="absolute top-4 left-4 bg-primary-gold text-white text-xs font-bold tracking-widest uppercase px-3 py-1">
                  Promoção
                </span>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                      'relative w-20 h-20 flex-shrink-0 border transition-all duration-300',
                      selectedImage === img
                        ? 'border-primary-gold opacity-100 ring-1 ring-primary-gold'
                        : 'border-transparent opacity-60 hover:opacity-100',
                    )}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info */}
          <div className="space-y-8 sticky top-24 h-fit">
            <div className="space-y-4">
              <h1 className="font-playfair text-4xl md:text-5xl text-deep-black leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-4">
                  <span className="font-poppins text-3xl font-medium text-primary-gold">
                    {formatCurrency(displayPrice)}
                  </span>
                  {product.preco_promocional && (
                    <span className="font-inter text-lg text-medium-gray line-through decoration-1">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
                {/* Actions */}
                <div className="flex gap-4">
                  <button className="text-medium-gray hover:text-rose-gold transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="text-medium-gray hover:text-deep-black transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-px bg-light-gray w-full" />

            {/* Description Short */}
            <p className="font-inter text-medium-gray leading-relaxed text-sm">
              {product.description?.slice(0, 150)}...
              <button
                onClick={() => setActiveTab('description')}
                className="text-deep-black underline ml-2 text-xs font-bold uppercase tracking-wider"
              >
                Ler tudo
              </button>
            </p>

            {/* CTA */}
            <div className="space-y-6 pt-4">
              {product.current_stock > 0 ? (
                <WhatsAppButton
                  productName={product.name}
                  variant="full"
                  className="w-full bg-primary-gold text-white font-montserrat font-bold uppercase tracking-widest py-4 hover:bg-light-gold hover:text-deep-black hover:scale-[1.02] transition-all shadow-luxury"
                />
              ) : (
                <div className="space-y-4 p-6 bg-zinc-50 border border-zinc-200 rounded-sm">
                  <div className="text-center space-y-1">
                    <p className="font-playfair text-xl text-deep-black font-bold">
                      Produto Indisponível
                    </p>
                    <p className="font-inter text-xs text-medium-gray">
                      Avise-me quando retornar ao estoque
                    </p>
                  </div>

                  {typeof window !== 'undefined' && localStorage.getItem('token') ? (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        if (!token) return;
                        const userId = Number(JSON.parse(atob(token.split('.')[1])).sub);

                        try {
                          await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/stock-notifications`,
                            {
                              email: 'user-logged-in',
                              product_id: product.id,
                              user_id: userId,
                            },
                          );
                          window.location.href = '/minha-conta/avisos-estoque';
                        } catch (error) {
                          console.error('Erro ao registrar:', error);
                          window.location.href = '/minha-conta/avisos-estoque';
                        }
                      }}
                      className="w-full bg-deep-black text-white font-montserrat font-bold uppercase tracking-widest py-4 hover:bg-primary-gold transition-all"
                    >
                      Confirmar Alerta
                    </button>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const email = formData.get('email') as string;

                        localStorage.setItem(
                          'pending_stock_alert',
                          JSON.stringify({
                            product_id: product.id,
                            guest_email: email,
                          }),
                        );
                        window.location.href = `/login?redirect=/minha-conta/avisos-estoque`;
                      }}
                      className="space-y-3"
                    >
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="Seu e-mail"
                        className="w-full px-4 py-3 text-sm border border-light-gray focus:border-primary-gold outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        className="w-full bg-deep-black text-white font-montserrat font-bold uppercase tracking-widest py-4 hover:bg-primary-gold transition-all"
                      >
                        Avise-me
                      </button>
                      <p className="text-[10px] text-medium-gray text-center italic">
                        Você será redirecionado para acessar sua conta.
                      </p>
                    </form>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-medium-gray font-inter">
                <ShieldCheck className="w-4 h-4" />
                <span>Garantia de 1 ano</span>
                <span className="w-1 h-1 bg-medium-gray rounded-full mx-2" />
                <Truck className="w-4 h-4" />
                <span>Envio para todo o Brasil</span>
              </div>
            </div>

            {/* Tabs (Description, Warranty, Shipping) */}
            <div className="mt-12">
              <div className="flex border-b border-light-gray">
                {['description', 'warranty', 'shipping'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      'flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all relative',
                      activeTab === tab
                        ? 'text-primary-gold'
                        : 'text-medium-gray hover:text-deep-black',
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
                      {product.sku && (
                        <p className="mt-4 text-xs text-medium-gray">REF: {product.sku}</p>
                      )}
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
                        <li>
                          Evite contato com produtos químicos, mar e piscina para maior
                          durabilidade.
                        </li>
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
                        Enviamos para todo o Brasil via Correios (PAC/Sedex). O prazo de postagem é
                        de até 2 dias úteis após a confirmação do pagamento.
                      </p>
                      <p>Frete grátis para compras acima de R$ 399,00.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
