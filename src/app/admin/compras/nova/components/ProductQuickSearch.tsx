import Image from 'next/image';
import { Search, Package, Plus, PlusCircle } from 'lucide-react';
import { Product } from '@/lib/services/products.service';

interface ProductQuickSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onOpenCreateModal: () => void;
}

export function ProductQuickSearch({
  searchTerm,
  onSearchChange,
  products,
  onAddProduct,
  onOpenCreateModal,
}: ProductQuickSearchProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
      <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
        <Package className="h-4 w-4 text-(--lumilee-gold)" />
        Adicionar Produtos
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar produto por nome ou SKU..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-(--lumilee-gold) outline-none text-lg"
        />
      </div>

      {searchTerm && (
        <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  onAddProduct(product);
                  onSearchChange('');
                }}
                className="flex items-center gap-3 p-3 bg-zinc-50 border rounded-lg hover:border-(--lumilee-gold) hover:bg-white transition text-left group"
              >
                <div className="w-12 h-12 bg-zinc-200 rounded flex items-center justify-center text-zinc-400 overflow-hidden relative">
                  {product.images?.[0] ? (
                    <Image src={product.images[0].url} alt="" fill className="object-cover" />
                  ) : (
                    <Package className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-zinc-500">SKU: {product.sku || '-'}</p>
                </div>
                <Plus className="h-5 w-5 text-zinc-300 group-hover:text-(--lumilee-gold)" />
              </button>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 text-sm font-bold text-(--lumilee-gold) hover:text-amber-600 transition-colors py-2 px-4 bg-amber-50 rounded-full border border-amber-100"
            >
              <PlusCircle className="h-4 w-4" />
              Não encontrou? Cadastrar novo produto &quot;{searchTerm}&quot;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
