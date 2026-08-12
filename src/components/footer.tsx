import Link from 'next/link';
import { Facebook, Instagram, ArrowRight } from 'lucide-react';

/**
 * Rodapé público da Lumilee (Refactored Luxury Design)
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-charcoal text-off-white border-t border-white/5">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <h3 className="font-playfair text-2xl font-bold text-primary-gold">Lumilee</h3>
            <p className="font-inter text-sm text-medium-gray leading-relaxed max-w-xs">
              Curadoria exclusiva de semijoias que unem elegância atemporal e design contemporâneo.
              Feitas para brilhar com você.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="p-2 rounded-full border border-white/10 hover:border-primary-gold hover:text-primary-gold transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full border border-white/10 hover:border-primary-gold hover:text-primary-gold transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-playfair text-lg mb-6 text-white font-medium">Explorar</h4>
            <ul className="space-y-4 font-inter text-sm text-medium-gray">
              <li>
                <Link
                  href="/novidades"
                  className="hover:text-primary-gold hover:pl-2 transition-all duration-300 inline-block"
                >
                  Novidades
                </Link>
              </li>
              <li>
                <Link
                  href="/colecoes"
                  className="hover:text-primary-gold hover:pl-2 transition-all duration-300 inline-block"
                >
                  Coleções
                </Link>
              </li>
              <li>
                <Link
                  href="/bestsellers"
                  className="hover:text-primary-gold hover:pl-2 transition-all duration-300 inline-block"
                >
                  Mais Vendidos
                </Link>
              </li>
              <li>
                <Link
                  href="/presentes"
                  className="hover:text-primary-gold hover:pl-2 transition-all duration-300 inline-block"
                >
                  Guia de Presentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-playfair text-lg mb-6 text-white font-medium">Atendimento</h4>
            <ul className="space-y-4 font-inter text-sm text-medium-gray">
              <li>
                <Link
                  href="/sobre"
                  className="hover:text-primary-gold hover:pl-2 transition-all duration-300 inline-block"
                >
                  Sobre a Marca
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="hover:text-primary-gold hover:pl-2 transition-all duration-300 inline-block"
                >
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-privacidade"
                  className="hover:text-primary-gold hover:pl-2 transition-all duration-300 inline-block"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/trocas"
                  className="hover:text-primary-gold hover:pl-2 transition-all duration-300 inline-block"
                >
                  Trocas e Devoluções
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-playfair text-lg mb-6 text-white font-medium">Newsletter</h4>
            <p className="font-inter text-sm text-medium-gray mb-4">
              Receba lançamentos exclusivos e ofertas especiais em primeira mão.
            </p>
            <form className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary-gold focus:outline-none focus:ring-1 focus:ring-primary-gold transition-all"
                />
              </div>
              <button className="bg-primary-gold text-deep-black font-montserrat font-medium text-sm py-3 px-6 uppercase tracking-wider hover:bg-light-gold transition-colors flex items-center justify-center gap-2">
                Assinar <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500 font-inter">
          <p>© {year} Lumilee. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            {/* Payment Icons could go here */}
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Pix</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
