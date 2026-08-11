import { Home, User as UserIcon, RefreshCcw, Loader2 } from 'lucide-react';
import { Product } from '@/lib/services/products.service';
import { ProductStock } from '@/lib/services/inventory.service';
import { LabelWithTooltip } from './LabelWithTooltip';
import { ProductFormChangeHandler, ProductFormState } from './types';

interface ProductIdentificationSectionProps {
  form: ProductFormState;
  onChange: ProductFormChangeHandler;
  onSkuBlur: () => void;
  validationErrors: Record<string, string>;
  loadingSku: boolean;
  existingProduct: Product | null;
  produto: Partial<Product> | null;
  stock: ProductStock | null | undefined;
  loadingStock: boolean;
  onOpenTransfer: () => void;
}

export function ProductIdentificationSection({
  form,
  onChange,
  onSkuBlur,
  validationErrors,
  loadingSku,
  existingProduct,
  produto,
  stock,
  loadingStock,
  onOpenTransfer,
}: ProductIdentificationSectionProps) {
  return (
    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-4">
      <h3 className="font-semibold text-zinc-800 flex items-center gap-2">
        📦 Identificação e Estoque
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <LabelWithTooltip
            label="SKU (Principal)"
            tooltip="Código interno da plataforma — é o próprio ID do produto no banco, gerado automaticamente. Não é editável."
          />
          <input
            type="text"
            name="sku"
            placeholder="Gerado automaticamente ao salvar"
            value={form.sku}
            disabled
            readOnly
            className="w-full border rounded-lg px-3 py-2 font-mono font-medium bg-zinc-100 text-zinc-500 cursor-not-allowed"
          />
        </div>

        <div>
          <LabelWithTooltip
            label="SKU Zarpellon"
            tooltip="Código da peça no fornecedor (impresso na etiqueta/planilha de compra). É o identificador usado pra reconhecer o produto na hora de comprar de novo."
            required
          >
            {loadingSku && <span className="ml-2 text-xs text-zinc-400">Buscando...</span>}
          </LabelWithTooltip>
          <input
            type="text"
            name="sku2"
            placeholder="Ex: 102030"
            value={form.sku2}
            onChange={onChange}
            onBlur={onSkuBlur}
            className={`w-full border-2 rounded-lg px-3 py-2 focus:ring-2 outline-none font-mono font-medium ${
              validationErrors.sku2
                ? 'border-red-300 focus:ring-red-200'
                : 'border-(--lumike-gold)/30 focus:ring-(--lumike-gold)'
            }`}
            required
            autoFocus
          />
          {validationErrors.sku2 && (
            <p className="text-[10px] text-red-500 mt-1 font-medium">{validationErrors.sku2}</p>
          )}
          {existingProduct && (
            <div className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded mt-1 border border-amber-200">
              ⚠ Produto existente. O valor abaixo será somado ao estoque atual.
            </div>
          )}
        </div>

        <div>
          <LabelWithTooltip
            label="Data de Compra"
            tooltip="Data que o produto foi comprado na Zarpellon ou fornecedor."
            required
          />
          <input
            type="date"
            name="purchase_date"
            value={form.purchase_date}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
      </div>

      {/* Distribuição por Malas (Apenas Edição) */}
      {produto && (
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              🏠 Estoque vs Revendedores
            </h4>
            <button
              type="button"
              onClick={onOpenTransfer}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
            >
              <RefreshCcw className="h-2.5 w-2.5" /> Transferir
            </button>
          </div>

          {loadingStock ? (
            <div className="flex items-center justify-center py-4 text-(--lumike-gold)">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : stock ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-zinc-100 flex items-center justify-between shadow-xs hover:border-(--lumike-gold)/30 transition-all">
                <div className="flex items-center gap-2">
                  <Home className="h-3.5 w-3.5 text-(--lumike-gold)" />
                  <span className="text-xs font-medium text-zinc-600">Estoque Lumike</span>
                </div>
                <span className="text-sm font-bold text-zinc-900">{stock.central}</span>
              </div>
              {stock.sellers.map((s) => (
                <div
                  key={s.user_id}
                  className="bg-white p-2.5 rounded-xl border border-zinc-100 flex items-center justify-between shadow-xs hover:border-(--lumike-gold)/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-600 truncate max-w-[80px]">
                      {s.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-zinc-900">{s.quantity}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-zinc-400 italic">Nenhuma distribuição registrada.</p>
          )}
        </div>
      )}
    </div>
  );
}
