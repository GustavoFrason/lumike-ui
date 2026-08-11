import { Search, Plus, QrCode } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/lib/services/products.service';
import { Loading } from '@/components/ui/loading';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface ProductSearchGridProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: () => void;
  onOpenScanner: () => void;
  loadingProducts: boolean;
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductSearchGrid({
  searchTerm,
  onSearchChange,
  onKeyDown,
  viewMode,
  onToggleViewMode,
  onOpenScanner,
  loadingProducts,
  products,
  onAddToCart,
}: ProductSearchGridProps) {
  return (
    <div className="xl:col-span-2 space-y-4">
      {/* Barra de Busca */}
      <div className="bg-white p-4 rounded-lg border border-zinc-200 sticky top-4 z-10 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              id="pos-search-input"
              type="text"
              placeholder="Buscar produto ou BIPAR código..."
              value={searchTerm}
              onChange={onSearchChange}
              onKeyDown={onKeyDown}
              autoFocus
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--lumike-gold) text-lg"
            />
          </div>
          <button
            onClick={onToggleViewMode}
            className="px-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition flex items-center gap-2"
            title="Alternar Visualização"
          >
            {viewMode === 'grid' ? (
              <Plus className="h-5 w-5 rotate-45" />
            ) : (
              <QrCode className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={onOpenScanner}
            className="px-4 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition flex items-center gap-2"
          >
            <QrCode className="h-5 w-5" />
            <span className="hidden md:inline">Ler Câmera</span>
          </button>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3 pb-8' : 'space-y-2 pb-8'}>
        {loadingProducts ? (
          <div className="col-span-2 text-center py-12">
            <Loading />
          </div>
        ) : products.length > 0 ? (
          products.map((product) => {
            const isPromo = !!product.preco_promocional;
            return (
              <div
                key={product.id}
                className={cn(
                  'bg-white p-3 rounded-lg border hover:border-(--lumike-gold) transition flex gap-3 group relative cursor-pointer',
                  viewMode === 'list' && 'p-2 items-center',
                )}
                onClick={() => onAddToCart(product)}
              >
                <div
                  className={cn(
                    'bg-zinc-100 rounded relative overflow-hidden shrink-0',
                    viewMode === 'grid' ? 'w-16 h-16' : 'w-10 h-10',
                  )}
                >
                  {product.images && product.images.length > 0 ? (
                    <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px]">
                      N/A
                    </div>
                  )}

                  {isPromo && viewMode === 'grid' && (
                    <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br shadow-sm z-10 animate-pulse">
                      OFF
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium text-zinc-900 truncate', viewMode === 'list' && 'text-sm')}>
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    {viewMode === 'grid' && <span>SKU: {product.sku || '-'}</span>}
                    {product.sku2 && (
                      <span className="bg-zinc-100 px-1 rounded text-[10px]">{product.sku2}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-(--lumike-gold) font-bold">
                      {formatCurrency(product.preco_promocional || product.price)}
                    </p>
                    {isPromo && viewMode === 'grid' && (
                      <span className="text-[10px] text-zinc-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                    {isPromo && viewMode === 'list' && (
                      <span className="bg-red-100 text-red-600 text-[9px] px-1 rounded font-bold">OFF</span>
                    )}
                  </div>
                </div>
                <div className="absolute right-3 bottom-1.5 opacity-0 group-hover:opacity-100 transition">
                  <Plus className="bg-(--lumike-gold) text-white p-1 h-6 w-6 rounded-full shadow-lg" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 text-zinc-400">Nenhum produto encontrado.</div>
        )}
      </div>
    </div>
  );
}
