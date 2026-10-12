import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@/lib/formatters';
import { Product } from '@/lib/services/products.service';
import { LABEL_TEXT_FONT_SIZE_PX, LABEL_TEXT_MAX_CHARS, PRODUCT_NAME_FONT_SIZE_PX } from './types';

interface LabelContentProps {
  product: Product;
  config: {
    fontSize: number;
    qrSize: number;
    showBranding: boolean;
    showProductName: boolean;
    showLabelText: boolean;
    offsetX: number;
    offsetY: number;
  };
}

export function LabelContent({ product, config }: LabelContentProps) {
  const labelText = product.label_text?.trim().slice(0, LABEL_TEXT_MAX_CHARS);

  return (
    <div
      className="w-full h-full flex items-center gap-1.5 p-1 relative"
      style={{ transform: `translate(${config.offsetX}px, ${config.offsetY}px)` }}
    >
      {config.showBranding && (
        <span
          className="absolute top-0 right-1 text-[7px] font-playfair font-bold text-zinc-300 tracking-[3px] uppercase"
          style={{ opacity: 0.8 }}
        >
          Lumilee
        </span>
      )}

      <div className="shrink-0 flex items-center justify-center">
        <QRCodeSVG value={product.sku || product.id.toString()} size={config.qrSize} level="L" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center h-full leading-none space-y-0.5">
        {config.showProductName && (
          <p
            className="font-bold line-clamp-2 text-zinc-900"
            style={{ fontSize: `${PRODUCT_NAME_FONT_SIZE_PX}px`, lineHeight: '1.2' }}
          >
            {product.name}
          </p>
        )}

        <p
          className="font-mono text-zinc-500"
          style={{ fontSize: `${Math.max(7, config.fontSize - 3)}px` }}
        >
          {product.sku}
        </p>

        <div className="mt-1 flex flex-col">
          {product.preco_promocional ? (
            <>
              <span
                className="text-zinc-400 line-through leading-none"
                style={{ fontSize: `${Math.max(7, config.fontSize - 2)}px` }}
              >
                {formatCurrency(product.price)}
              </span>
              <span
                className="font-bold text-zinc-900 leading-none mt-0.5"
                style={{ fontSize: `${config.fontSize + 2}px` }}
              >
                {formatCurrency(product.preco_promocional)}
              </span>
            </>
          ) : (
            <span
              className="font-bold text-zinc-900"
              style={{ fontSize: `${config.fontSize + 2}px` }}
            >
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {config.showLabelText && labelText && (
          <p
            data-testid="label-text"
            className="font-semibold uppercase text-zinc-900 line-clamp-2 wrap-break-word"
            style={{ fontSize: `${LABEL_TEXT_FONT_SIZE_PX}px`, lineHeight: '1.1' }}
          >
            {labelText}
          </p>
        )}
      </div>
    </div>
  );
}
