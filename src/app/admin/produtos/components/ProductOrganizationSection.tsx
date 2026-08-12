import { Plus, Check, X } from 'lucide-react';
import { Category } from '@/lib/services/categories.service';
import { Supplier } from '@/lib/services/suppliers.service';
import { User as UserModel } from '@/lib/services/users.service';
import { Product } from '@/lib/services/products.service';
import { LabelWithTooltip } from './LabelWithTooltip';
import { ProductFormChangeHandler, ProductFormState } from './types';

interface ProductOrganizationSectionProps {
  form: ProductFormState;
  onChange: ProductFormChangeHandler;
  validationErrors: Record<string, string>;
  produto: Partial<Product> | null;
  existingProduct: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  sellers: UserModel[];
  initialSellerId: string;
  onInitialSellerIdChange: (value: string) => void;
  showQuickCategory: boolean;
  onToggleQuickCategory: (show: boolean) => void;
  newCategoryName: string;
  onNewCategoryNameChange: (value: string) => void;
  creatingCategory: boolean;
  onQuickAddCategory: () => void;
}

export function ProductOrganizationSection({
  form,
  onChange,
  validationErrors,
  produto,
  existingProduct,
  categories,
  suppliers,
  sellers,
  initialSellerId,
  onInitialSellerIdChange,
  showQuickCategory,
  onToggleQuickCategory,
  newCategoryName,
  onNewCategoryNameChange,
  creatingCategory,
  onQuickAddCategory,
}: ProductOrganizationSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <LabelWithTooltip
              label="Categoria"
              tooltip="Grupo onde este produto será exibido (ex: Anéis, Colares)."
            />
            {!showQuickCategory && (
              <button
                type="button"
                onClick={() => onToggleQuickCategory(true)}
                className="text-xs text-(--lumilee-gold) hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Nova
              </button>
            )}
          </div>

          {showQuickCategory ? (
            <div className="flex gap-2 animate-in fade-in">
              <input
                type="text"
                placeholder="Nome da categoria"
                className="flex-1 border rounded-lg px-3 py-1 text-sm"
                value={newCategoryName}
                onChange={(e) => onNewCategoryNameChange(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={onQuickAddCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="p-1 text-green-600 bg-green-50 rounded hover:bg-green-100"
              >
                <Check className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleQuickCategory(false);
                  onNewCategoryNameChange('');
                }}
                className="p-1 text-red-600 bg-red-50 rounded hover:bg-red-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <select
              name="category_id"
              value={form.category_id}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Selecione...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <LabelWithTooltip
            label="Fornecedor"
            tooltip="Origem do produto para acompanhamento de ROI."
          />
          <select
            name="supplier_id"
            value={form.supplier_id}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Selecione...</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={`grid ${!produto?.id ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-4`}
      >
        <div>
          <LabelWithTooltip label="Estoque Inicial" tooltip="Quantidade atual em estoque." />
          <input
            type="number"
            name="current_stock"
            placeholder="0"
            min="0"
            value={form.current_stock}
            onChange={onChange}
            className={`w-full border rounded-lg px-3 py-2 text-center font-mono ${
              existingProduct ? 'bg-amber-100 border-amber-300' : ''
            } ${validationErrors.current_stock ? 'border-red-300 focus:ring-red-200' : ''}`}
            required
          />
          {validationErrors.current_stock && (
            <p className="text-[10px] text-red-500 mt-1 font-medium">
              {validationErrors.current_stock}
            </p>
          )}
        </div>
        {!produto?.id && (
          <div>
            <LabelWithTooltip
              label="Destino Inicial"
              tooltip="Selecione caso o estoque inicial fique com um revendedor específico."
            />
            <select
              value={initialSellerId}
              onChange={(e) => onInitialSellerIdChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-zinc-700"
            >
              <option value="">Estoque Lumilee (Central)</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Revendedor)
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <LabelWithTooltip
            label="Coleção (Texto)"
            tooltip="Nome da coleção (opcional, ex: Verão 2025)."
          />
          <input
            type="text"
            name="collection"
            placeholder="Ex: Verão 2025"
            value={form.collection}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>
    </>
  );
}
