import { fetchServer } from '@/lib/api-server';
import { Product } from '@/lib/services/products.service';
import { ProductDetails } from '@/components/catalog/product-details';
import { Metadata, ResolvingMetadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  // Try getting by slug first
  try {
    const data = await fetchServer<Product>(`/products/slug/${slug}`);
    if (data) return data;
  } catch (e) {
    // ignore
  }

  // Try by ID as fallback
  try {
    const data = await fetchServer<Product>(`/products/${slug}`);
    if (data) return data;
  } catch (e) {
    // ignore
  }

  return null;
}

async function getProductImages(id: string): Promise<string[]> {
  try {
    const data = await fetchServer<{ url: string }[]>(`/products/${id}/images`);
    return data?.map((d) => d.url) || [];
  } catch (e) {
    return [];
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params; // Await params in newer Next.js versions
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Produto não encontrado | Lumilee',
    };
  }

  const images = await getProductImages(product.id.toString());
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${product.name} | Lumilee Semijoias`,
    description:
      product.description?.slice(0, 160) ||
      'Descubra a elegância exclusiva das semijoias Lumilee.',
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      // Domínio antigo (lumike.com.br) mantido de propósito — a marca
      // registrou "Lumilee" mas o domínio novo ainda não existe.
      url: `https://lumike.com.br/produtos/${slug}`, // Ideally use valid domain env var
      images: [...images, ...previousImages],
      siteName: 'Lumilee Semijoias',
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.slice(0, 160),
      images: images[0] ? [images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-playfair text-2xl mb-2">Produto não encontrado</h1>
          <p className="text-medium-gray">Tente buscar por outro item.</p>
        </div>
      </div>
    );
  }

  const images = await getProductImages(product.id.toString());

  return <ProductDetails product={product} images={images} />;
}
