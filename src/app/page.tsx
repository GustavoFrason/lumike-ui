import { Suspense } from 'react';
import { fetchServer } from '@/lib/api-server';
import { Product } from '@/lib/services/products.service';
import { Category } from '@/lib/services/categories.service';
import { ProductCard } from '@/components/catalog/product-card';
import { Filters } from '@/components/catalog/filters';
import { HomeHero } from '@/components/home-hero';
import { BenefitsBar } from '@/components/home-benefits-bar';
import { Loading } from '@/components/ui/loading';
import { ProductCarousel } from '@/components/catalog/ProductCarousel';
import { CategoryCarousel } from '@/components/catalog/CategoryCarousel';
import { FadeIn } from '@/components/ui/fade-in';
import { LuxuryBackground } from '@/components/ui/luxury-background';

interface Setting {
  key: string;
  value: string;
}

async function getSettings() {
  const data = await fetchServer<Setting[]>('/settings');
  return data || [];
}

interface Collection {
  id: string;
  nome: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = 1;
  const searchTerm = searchParams.q as string | undefined;
  const categoryId = searchParams.category as string | undefined;
  const collectionId = searchParams.collection as string | undefined;

  const query = new URLSearchParams({
    page: page.toString(),
    limit: '100',
    is_active: 'true',
  });

  const response = await fetchServer<PaginatedResponse<Product>>(`/products?${query.toString()}`);
  let products = response?.data || [];

  if (searchTerm) {
    const lowerTerm = searchTerm.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(lowerTerm) ||
      p.description?.toLowerCase().includes(lowerTerm)
    );
  }

  if (categoryId) {
    products = products.filter(p => p.category_id?.toString() === categoryId);
  }

  if (collectionId) {
    products = products.filter(p => p.colecao_id === collectionId);
  }

  return products;
}

async function getCategories() {
  const data = await fetchServer<Category[]>('/categories?is_active=true');
  return data || [];
}

async function getCollections() {
  const data = await fetchServer<Collection[]>('/collections?is_active=true');
  return data || [];
}

export const dynamic = 'force-dynamic';

async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error('Error fetching data:', error);
    return fallback;
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const [products, categories, collections, settingsArr] = await Promise.all([
    safeFetch(getProducts(params), []),
    safeFetch(getCategories(), []),
    safeFetch(getCollections(), []),
    safeFetch(getSettings(), [])
  ]);

  const settings = settingsArr.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);

  const heroImage = settings['hero_banner_url']; // This will be passed to Client Component
  const title = settings['hero_title'] || 'Elegância Atemporal';
  const subtitle = settings['hero_subtitle'] || 'Descubra nossa coleção exclusiva de semijoias que unem sofisticação e estilo.';

  return (
    <div className="bg-[#faf9f6] min-h-screen pb-20 relative overflow-hidden">
      {/* Sophisticated Background System - Mesh Gradient + Texture */}
      <LuxuryBackground />

      <HomeHero title={title} subtitle={subtitle} imageUrl={heroImage} />

      <BenefitsBar />

      <main className="container mx-auto px-6 md:px-12 relative z-20 mt-12">
        {/* Featured Products */}
        {products.filter(p => p.is_featured).length > 0 && (
          <FadeIn delay={0.2} className="mb-16">
            <ProductCarousel
              title="Nossos Destaques"
              subtitle="Peças exclusivas selecionadas para brilhar com você"
              products={products.filter(p => p.is_featured)}
            />
          </FadeIn>
        )}

        {/* Filters - Ensuring maximum contrast */}
        <FadeIn className="bg-white/95 backdrop-blur-md p-6 shadow-luxury rounded-sm mb-12 border border-zinc-100 relative z-30">
          <Filters categories={categories} collections={collections} />
          <p className="text-[10px] text-zinc-400 mt-4 text-right font-inter tracking-widest uppercase">
            {products.length} Peças Disponíveis
          </p>
        </FadeIn>

        {/* Product Grid Section Title */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-playfair font-bold text-deep-black mb-2 uppercase tracking-[0.2em]">Nossos Destaques</h2>
          <p className="text-zinc-500 font-inter text-sm max-w-xl mx-auto">Confira as peças que são tendência nesta temporada</p>
        </div>

        {/* Products Grid */}
        <FadeIn delay={0.2}>
          <Suspense fallback={<Loading size="lg" className="py-20" />}>
            {products.length === 0 ? (
              <div className="text-center py-24">
                <h3 className="font-playfair text-2xl text-deep-black mb-2">Nenhum produto encontrado</h3>
                <p className="text-medium-gray font-inter">Tente ajustar seus filtros de busca.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </Suspense>
        </FadeIn>

        {/* Categories Carousel */}
        {categories.length > 0 && (
          <FadeIn delay={0.4} className="mb-24">
            <CategoryCarousel categories={categories} />
          </FadeIn>
        )}

      </main>
    </div>
  );
}
