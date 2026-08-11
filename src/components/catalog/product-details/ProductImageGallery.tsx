import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/services/products.service';

interface ProductImageGalleryProps {
  product: Product;
  images: string[];
  selectedImage: string;
  onSelectImage: (image: string) => void;
}

export function ProductImageGallery({
  product,
  images,
  selectedImage,
  onSelectImage,
}: ProductImageGalleryProps) {
  return (
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
              onClick={() => onSelectImage(img)}
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
  );
}
