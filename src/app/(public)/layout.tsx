import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </>
  );
}
