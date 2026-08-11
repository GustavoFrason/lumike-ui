import { Printer } from 'lucide-react';
import { Product } from '@/lib/services/products.service';
import { LabelConfig } from './types';
import { LabelContent } from './LabelContent';

interface LabelPreviewGridProps {
  labelList: Product[];
  config: LabelConfig;
  onUpdateQuantity: (productId: number, delta: number) => void;
}

export function LabelPreviewGrid({ labelList, config, onUpdateQuantity }: LabelPreviewGridProps) {
  return (
    <div className="bg-zinc-100 p-8 rounded-lg border border-zinc-200 md:col-span-2 overflow-y-auto h-[calc(100vh-280px)]">
      {labelList.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
          <Printer className="h-12 w-12 mb-4 opacity-20" />
          <p>Adicione quantidades para visualizar as etiquetas</p>
        </div>
      ) : (
        <div className="flex flex-wrap content-start gap-2">
          {labelList.map((product, idx) => (
            <div
              key={`${product.id}-${idx}`}
              className="bg-white border border-dashed border-zinc-300 flex items-center overflow-hidden relative"
              style={{
                width: `${config.width}mm`,
                height: `${config.height}mm`,
                padding: '1mm',
              }}
            >
              <LabelContent product={product} config={config} />
              <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/5 opacity-0 hover:opacity-100 transition flex justify-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(product.id, -1)}
                  className="text-[10px] bg-white border rounded px-1 shadow-sm hover:text-red-500"
                >
                  Remover uma
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
