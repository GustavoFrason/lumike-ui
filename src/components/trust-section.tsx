'use client';

import { FadeIn } from './ui/fade-in';
import { ShieldCheck, Gem, Sparkles, Heart } from 'lucide-react';

const values = [
  {
    icon: ShieldCheck,
    title: 'Qualidade Premium',
    description: 'Banho de ouro 18k e ródio com tecnologia antialérgica de alta performance.',
  },
  {
    icon: Gem,
    title: 'Design Exclusivo',
    description: 'Peças curadas para mulheres que buscam sofisticação em cada detalhe.',
  },
  {
    icon: Sparkles,
    title: 'Brilho Duradouro',
    description: 'Verniz de proteção extra que garante o brilho da sua peça por muito mais tempo.',
  },
  {
    icon: Heart,
    title: 'Feito para Você',
    description: 'Cada detalhe é pensado para elevar sua autoestima e celebrar sua beleza.',
  },
];

export function TrustSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Brand Story / Concept */}
          <FadeIn direction="right" className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-primary-gold font-montserrat text-xs font-bold uppercase tracking-[0.3em]">
                Conceito Lumilee
              </h3>
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-zinc-900 leading-tight">
                Brilhe com a <br />
                <span className="italic">Elegância</span> que você merece.
              </h2>
            </div>

            <p className="text-zinc-600 font-inter leading-relaxed max-w-lg">
              A Lumilee nasceu do desejo de democratizar o luxo. Nossas semijoias combinam o design
              da alta joalheria com a durabilidade que o seu dia a dia exige. Cada peça é uma
              promessa de sofisticação e confiança.
            </p>

            <div className="pt-4">
              <div className="inline-flex items-center gap-4 p-4 bg-white shadow-luxury rounded-sm border border-zinc-100">
                <div className="w-12 h-12 bg-primary-gold/10 rounded-full flex items-center justify-center">
                  <ShieldCheck className="text-primary-gold w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                    Garantia Vitalícia
                  </p>
                  <p className="text-xs text-zinc-500">No banho de todas as peças</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <FadeIn
                key={index}
                delay={index * 0.1}
                className="p-8 bg-white/40 backdrop-blur-sm border border-zinc-100 hover:border-primary-gold transition-colors duration-500 rounded-sm"
              >
                <value.icon className="w-8 h-8 text-primary-gold mb-6 stroke-[1.5]" />
                <h4 className="text-lg font-playfair font-bold text-zinc-900 mb-3">
                  {value.title}
                </h4>
                <p className="text-sm text-zinc-500 font-inter leading-relaxed">
                  {value.description}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary-gold/5 blur-[100px] pointer-events-none" />
    </section>
  );
}
