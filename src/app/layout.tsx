import './globals.css';
import type { Metadata } from 'next';
import { Playfair_Display, Montserrat, Inter, Poppins } from 'next/font/google';
import { PublicChrome } from '@/components/layout/PublicChrome';
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from '@/contexts/session-context';
import { FavoritesProvider } from '@/contexts/favorites-context';
import { SiteSettingsProvider } from '@/contexts/site-settings-context';
import { getSiteSettings } from '@/lib/site-settings.server';

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

const SITE_NAME = 'Lumilee Semijoias';

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description:
    'Semijoias Lumilee: anéis, brincos, colares e pulseiras com acabamento de luxo. Veja a vitrine e fale com a gente pelo WhatsApp.',
  openGraph: {
    siteName: SITE_NAME,
    locale: 'pt_BR',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Já vem do servidor: o botão de WhatsApp aparece no primeiro render, sem
  // esperar uma busca no navegador. `null` (API fora) = o provider busca lá.
  const settings = await getSiteSettings();

  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${montserrat.variable} ${inter.variable} ${poppins.variable} h-full w-full`}
      suppressHydrationWarning
    >
      <body className="h-full w-full font-sans antialiased bg-(--off-white) text-(--deep-black) flex flex-col">
        <SessionProvider>
          <SiteSettingsProvider initialSettings={settings ?? undefined}>
            <FavoritesProvider>
              <PublicChrome>{children}</PublicChrome>
              <Toaster />
            </FavoritesProvider>
          </SiteSettingsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
