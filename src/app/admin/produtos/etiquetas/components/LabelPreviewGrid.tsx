import { Printer } from 'lucide-react';
import { Product } from '@/lib/services/products.service';
import { LabelConfig, getLabelGridStyle, getLabelGridColumn } from './types';
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
    <div className="bg-zinc-100 p-8 rounded-lg border border-zinc-200 md:col-span-2 overflow-auto h-[max(420px,calc(100vh_-_460px))]">
      {labelList.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
          <Printer className="h-12 w-12 mb-4 opacity-20" />
          <p>Adicione quantidades para visualizar as etiquetas</p>
        </div>
      ) : (
        <div
          // Mesmo grid (columnsPerRow colunas fixas) do bloco de impressão em
          // page.tsx (via getLabelGridStyle) — sem isso o preview nunca reflete
          // quantas etiquetas cabem por fileira de verdade, e o ajuste fino vira
          // tentativa-e-erro gastando etiqueta física. `overflow-auto` no pai
          // (acima) evita que uma janela estreita quebre esse grid.
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
                // As tracks do grid intercalam conteúdo/vão (ver
                // getLabelGridStyle) — sem isso cada etiqueta cairia numa
                // track errada (metade nas tracks de vão).
                gridColumn: getLabelGridColumn(idx % config.columnsPerRow),
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
