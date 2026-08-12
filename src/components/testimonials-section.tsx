'use client';

import { FadeIn } from './ui/fade-in';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Mariana Silva',
    location: 'Curitiba, PR',
    content:
      'As peças são simplesmente divinas. O brilho é impecável e realmente não escurecem. Já sou cliente fiel!',
    rating: 5,
  },
  {
    name: 'Beatriz Oliveira',
    location: 'São Paulo, SP',
    content:
      'Fiquei impressionada com o cuidado na embalagem e a rapidez da entrega. A qualidade do banho é visível.',
    rating: 5,
  },
  {
    name: 'Ana Paula G.',
    location: 'Joinville, SC',
    content:
      'Comprei um conjunto para um casamento e recebi muitos elogios. Elegância pura. Recomendo muito a Lumilee.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-zinc-900 text-white relative overflow-hidden z-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-playfair font-bold text-white mb-4 uppercase tracking-[0.2em]">
            Experiência Lumilee
          </h2>
          <p className="text-zinc-400 font-inter text-sm italic">
            O que nossas clientes dizem sobre nós
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <FadeIn
              key={index}
              delay={index * 0.15}
              className="flex flex-col items-center text-center p-8 border border-white/10 rounded-sm bg-white/5 backdrop-blur-md"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary-gold text-primary-gold" />
                ))}
              </div>

              <blockquote className="text-lg font-playfair italic mb-8 flex-1">
                &quot;{t.content}&quot;
              </blockquote>

              <div>
                <cite className="not-italic font-bold text-primary-gold block uppercase tracking-widest text-xs mb-1">
                  {t.name}
                </cite>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  {t.location}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Background patterns */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-gold/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-gold/5 blur-[100px] rounded-full pointer-events-none" />
    </section>
  );
}
