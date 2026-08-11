import { LabelWithTooltip } from './LabelWithTooltip';
import { ProductFormChangeHandler, ProductFormState } from './types';

interface ProductDetailsSectionProps {
  form: ProductFormState;
  onChange: ProductFormChangeHandler;
  validationErrors: Record<string, string>;
}

export function ProductDetailsSection({
  form,
  onChange,
  validationErrors,
}: ProductDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <LabelWithTooltip
            label="Nome do Produto"
            tooltip="Nome completo exibido no site e vitrine."
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Nome do produto"
            value={form.name}
            onChange={onChange}
            className={`w-full border rounded-lg px-3 py-2 font-medium ${
              validationErrors.name ? 'border-red-300 focus:ring-red-200' : ''
            }`}
            required
          />
          {validationErrors.name && (
            <p className="text-[10px] text-red-500 mt-1 font-medium">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <LabelWithTooltip
            label="Descrição Resumida (Etiqueta)"
            tooltip="Descrição curta para etiqueta e Nota Fiscal. Máx 40 caracteres."
            required
          />
          <div className="relative">
            <input
              type="text"
              name="short_description"
              placeholder="Ex: Anel Solitário Ouro"
              value={form.short_description}
              onChange={onChange}
              maxLength={40}
              className="w-full border rounded-lg px-3 py-2 pr-12"
              required
            />
            <span
              className={`absolute right-3 top-2 text-xs font-medium pointer-events-none ${
                form.short_description.length >= 35 ? 'text-amber-500' : 'text-zinc-400'
              }`}
            >
              {form.short_description.length}/40
            </span>
          </div>
        </div>

        <div className="md:col-span-2">
          <LabelWithTooltip
            label="Descrição Completa (Site)"
            tooltip="Texto rico para a página de detalhes do produto. Use termos atrativos."
          />
          <textarea
            name="description"
            placeholder="Detalhes, história e diferenciais da peça..."
            value={form.description}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
