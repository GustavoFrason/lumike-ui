import Image from 'next/image';
import { Package, ImageIcon } from 'lucide-react';
import { Product } from '@/lib/services/products.service';
import { WarrantyOrigin } from '@/lib/services/warranties.service';

interface ProductSelectionSectionProps {
  origin: WarrantyOrigin | undefined;
  products: Product[];
  selectedProductId: number | null;
  onSelectProduct: (id: number) => void;
  productLocked: boolean;
  selectedProduct: Product | null;
}

export function ProductSelectionSection({
  origin,
  products,
  selectedProductId,
  onSelectProduct,
  productLocked,
  selectedProduct,
}: ProductSelectionSectionProps) {
  return (
    <div
      className={`space-y-4 p-4 rounded-xl border border-zinc-100 ${origin === 'stock' ? 'md:col-span-2' : ''} bg-zinc-50`}
    >
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
        <Package className="h-3 w-3" /> Identificação do Produto
      </h3>

      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-700">Produto</label>
        <select
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-gold bg-white"
          required
          value={selectedProductId || ''}
          onChange={(e) => onSelectProduct(Number(e.target.value))}
          disabled={productLocked}
        >
          <option value="">Selecione o produto...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
      </div>

      {/* Product Preview Card */}
      {selectedProduct && (
        <div className="flex bg-white p-3 rounded-lg border border-zinc-200 shadow-sm gap-4 animate-in fade-in slide-in-from-left-2">
          <div className="h-20 w-20 bg-zinc-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden border border-zinc-100 relative">
            {selectedProduct.images && selectedProduct.images.length > 0 ? (
              <Image
                src={selectedProduct.images[0].url}
                alt={selectedProduct.name}
                fill
                className="object-cover"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-zinc-300" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="font-bold text-zinc-900 text-sm">{selectedProduct.name}</h4>
            <span className="text-xs text-zinc-500 font-mono">SKU: {selectedProduct.sku}</span>
            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full w-fit mt-1">
              Estoque Atual: {selectedProduct.current_stock}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
