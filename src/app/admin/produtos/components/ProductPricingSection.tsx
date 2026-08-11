import { CurrencyInputATM } from '@/components/ui/currency-input-atm';
import { parseCurrencyBR } from '@/lib/formatters';
import { LabelWithTooltip } from './LabelWithTooltip';
import { ProductFormState } from './types';

interface ProductPricingSectionProps {
  form: ProductFormState;
  validationErrors: Record<string, string>;
  onPriceFieldChange: (field: 'cost_price' | 'price' | 'preco_promocional', value: string) => void;
}

export function ProductPricingSection({
  form,
  validationErrors,
  onPriceFieldChange,
}: ProductPricingSectionProps) {
  const price = parseCurrencyBR(form.price);
  const costPrice = parseCurrencyBR(form.cost_price);
  const promoPrice = form.preco_promocional ? parseCurrencyBR(form.preco_promocional) : price;

  const hasMargin = price > 0 && costPrice > 0;
  const profit = hasMargin ? promoPrice - costPrice : 0;
  const margin = hasMargin ? (profit / promoPrice) * 100 : 0;
  const isLowMargin = margin < 20;
  const isNegativeMargin = margin < 0;
  const marginColor = isNegativeMargin ? 'text-red-500' : isLowMargin ? 'text-amber-500' : 'text-green-600';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50/50 p-4 rounded-lg border border-green-100">
      <div>
        <LabelWithTooltip label="Preço de Custo" tooltip="Valor pago ao fornecedor. Usado para cálculo de lucro." />
        <CurrencyInputATM
          name="cost_price"
          placeholder="R$ 0,00"
          value={form.cost_price}
          decimalsLimit={2}
          onValueChange={(value) => onPriceFieldChange('cost_price', value || '')}
          prefix="R$ "
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <LabelWithTooltip label="Preço de Venda" tooltip="Valor final para o cliente." required />
        <CurrencyInputATM
          name="price"
          placeholder="R$ 0,00"
          value={form.price}
          decimalsLimit={2}
          onValueChange={(value) => onPriceFieldChange('price', value || '')}
          prefix="R$ "
          className={`w-full border rounded-lg px-3 py-2 font-bold text-zinc-800 ${
            validationErrors.price ? 'border-red-300 focus:ring-red-200 shadow-sm shadow-red-50' : ''
          }`}
          required
        />
        {validationErrors.price && (
          <p className="text-[10px] text-red-500 mt-1 font-medium">{validationErrors.price}</p>
        )}
      </div>

      <div>
        <LabelWithTooltip
          label="Preço Promocional"
          tooltip="Se preenchido, aparecerá como 'De/Por' no site."
        />
        <CurrencyInputATM
          name="preco_promocional"
          placeholder="R$ 0,00"
          value={form.preco_promocional}
          decimalsLimit={2}
          onValueChange={(value) => onPriceFieldChange('preco_promocional', value || '')}
          prefix="R$ "
          className={`w-full border rounded-lg px-3 py-2 text-green-700 font-medium ${
            validationErrors.preco_promocional ? 'border-red-300 focus:ring-red-200' : ''
          }`}
        />
        {validationErrors.preco_promocional && (
          <p className="text-[10px] text-red-500 mt-1 font-medium">{validationErrors.preco_promocional}</p>
        )}
      </div>

      {/* Profit Indicator */}
      <div className="md:col-span-3 flex items-center justify-between px-1">
        {hasMargin ? (
          <div className="flex gap-4 text-xs font-medium">
            <span className={marginColor}>
              Lucro Bruto: R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className={marginColor}>
              Margem: {margin.toFixed(1)}% {isNegativeMargin && '⚠️ NEGATIVA'}
            </span>
          </div>
        ) : (
          <div />
        )}

        {costPrice > price && (
          <p className="text-[10px] text-red-500 font-bold animate-pulse">
            ⚠️ Preço de custo maior que preço de venda!
          </p>
        )}
      </div>
    </div>
  );
}
