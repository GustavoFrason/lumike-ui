'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FloatingWhatsApp } from '@/components/ui/floating-whatsapp';
import { LeadCaptureModal } from '@/components/lead-capture-modal';

/**
 * Casca da loja: cabeçalho, rodapé, WhatsApp flutuante e modal de lead.
 * Não aparece no painel (/admin) nem no login.
 *
 * Fica fora do layout raiz porque precisa do `usePathname` (cliente), e o
 * layout raiz é Server Component para ter metadata e buscar as
 * configurações da loja no servidor.
 */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStorefront = !pathname?.startsWith('/admin') && pathname !== '/login';

  return (
    <>
      {isStorefront && <Header />}

      <div className="grow">{children}</div>

      {isStorefront && (
        <>
          <FloatingWhatsApp />
          <LeadCaptureModal />
          <Footer />
        </>
      )}
    </>
  );
}
