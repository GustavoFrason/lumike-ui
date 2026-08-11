import { ImageUpload } from '@/components/ui/image-upload';
import { LabelWithTooltip } from './LabelWithTooltip';
import { ProductFormChangeHandler, ProductFormState } from './types';

interface ProductImagesAndTogglesProps {
  form: ProductFormState;
  onChange: ProductFormChangeHandler;
  productImages: string[];
  onImageUpload: (file: File, url: string) => Promise<void>;
  onImageRemove: (url: string) => Promise<void>;
  disabled: boolean;
}

export function ProductImagesAndToggles({
  form,
  onChange,
  productImages,
  onImageUpload,
  onImageRemove,
  disabled,
}: ProductImagesAndTogglesProps) {
  return (
    <>
      <div>
        <LabelWithTooltip
          label="Imagens do Produto"
          tooltip="Fotos do produto. A primeira será a capa."
        />
        <ImageUpload
          onUpload={onImageUpload}
          onRemove={onImageRemove}
          existingImages={productImages}
          maxImages={10}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-6 p-4 bg-zinc-50 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={onChange}
            className="w-5 h-5 rounded border-zinc-300 text-(--lumike-gold) focus:ring-(--lumike-gold)"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-800">Ativo</span>
            <span className="text-xs text-zinc-500">Visível no catálogo</span>
          </div>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_featured"
            checked={form.is_featured}
            onChange={onChange}
            className="w-5 h-5 rounded border-zinc-300 text-(--lumike-gold) focus:ring-(--lumike-gold)"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-800">Destaque</span>
            <span className="text-xs text-zinc-500">Aparece na Home</span>
          </div>
        </label>
      </div>
    </>
  );
}
