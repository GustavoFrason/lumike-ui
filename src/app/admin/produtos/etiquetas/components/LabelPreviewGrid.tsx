import { Printer } from 'lucide-react';
import { Product } from '@/lib/services/products.service';
import { LabelConfig, getLabelGridStyle } from './types';
import { LabelContent } from './LabelContent';

interface LabelPreviewGridProps {
  labelList: Product[];
  config: LabelConfig;
  onUpdateQuantity: (productId: number, delta: number) => void;
}

export function LabelPreviewGrid({ labelList, config, onUpdateQuantity }: LabelPreviewGridProps) {
  return (
    // Altura = viewport menos o espaço do cabeçalho da página + o painel de
    // configuração acima (que cresce conforme os campos dele mudam — daí o
    // `max()` com um piso fixo, pra não colapsar numa tela baixa/notebook em
    // vez de só chutar um número que precisa ser recalibrado toda hora).
    <div className="bg-zinc-100 p-8 rounded-lg border border-zinc-200 md:col-span-2 overflow-y-auto h-[max(420px,calc(100vh_-_460px))]">
      {labelList.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
          <Printer className="h-12 w-12 mb-4 opacity-20" />
          <p>Adicione quantidades para visualizar as etiquetas</p>
        </div>
      ) : (
        <div
          className="flex flex-wrap content-start"
          // Mesmo cálculo de columnGap/edgeMargin do bloco de impressão em
          // page.tsx (via getLabelGridStyle) — sem isso o preview nunca reflete
          // o espaçamento real entre colunas da bobina, e o ajuste fino vira
          // tentativa-e-erro gastando etiqueta física.
          style={getLabelGridStyle(config)}
        >
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
