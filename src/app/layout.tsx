'use client';

import './globals.css';
import { Playfair_Display, Montserrat, Inter, Poppins } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FloatingWhatsApp } from '@/components/ui/floating-whatsapp';
import { LeadCaptureModal } from '@/components/lead-capture-modal';
import { Toaster } from "@/components/ui/toaster"
import { FavoritesProvider } from '@/contexts/favorites-context';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isLogin = pathname === '/login';

  return (
    <html lang="pt-BR" className={`${playfair.variable} ${montserrat.variable} ${inter.variable} ${poppins.variable} h-full w-full`} suppressHydrationWarning>
      <body className="h-full w-full font-sans antialiased bg-[var(--off-white)] text-[var(--deep-black)] flex flex-col">
        <FavoritesProvider>
          {!isAdmin && !isLogin && <Header />}

          <div className="flex-grow">
            {children}
          </div>

          {!isAdmin && !isLogin && (
            <>
              <FloatingWhatsApp />
              <LeadCaptureModal />
              <Footer />
            </>
          )}
          <Toaster />
        </FavoritesProvider>
      </body>
    </html>
  );
}