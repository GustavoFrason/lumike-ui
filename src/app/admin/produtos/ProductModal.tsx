'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, productsService } from '@/lib/services/products.service';
import { categoriesService } from '@/lib/services/categories.service';
import { usersService, User as UserModel } from '@/lib/services/users.service';
import { imagesService } from '@/lib/services/images.service';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCollections } from '@/lib/hooks/use-collections';
import { useSuppliers } from '@/lib/hooks/use-suppliers';
import { parseCurrencyBR } from '@/lib/formatters';
import { ErrorMessage } from '@/components/ui/error-message';
import { useInventory } from '@/lib/hooks/use-inventory';
import { TransferStockModal } from '../estoque/TransferStockModal';
import { ProductFormState } from './components/types';
import { ProductIdentificationSection } from './components/ProductIdentificationSection';
import { ProductDetailsSection } from './components/ProductDetailsSection';
import { ProductPricingSection } from './components/ProductPricingSection';
import { ProductOrganizationSection } from './components/ProductOrganizationSection';
import { ProductImagesAndToggles } from './components/ProductImagesAndToggles';

interface ModalProps {
  produto: Partial<Product> | null;
  onClose: () => void;
  onSave: (produto: Partial<Product> & { pendingFiles?: File[] }) => void;
  loading?: boolean;
  error?: string | null;
}

export function ProductModal({ produto, onClose, onSave, loading = false, error }: ModalProps) {
  const { categories, loadCategories } = useCategories();
  const { loadCollections } = useCollections();
  const { suppliers, loadSuppliers } = useSuppliers();

  const [form, setForm] = useState<ProductFormState>({
    name: produto?.name || '',
    sku: produto?.sku || '',
    sku2: produto?.sku2 || '',
    short_description: produto?.short_description || '',
    description: produto?.description || '',
    price: produto?.price?.toString().replace('.', ',') || '',
    preco_promocional: produto?.preco_promocional?.toString().replace('.', ',') || '',
    cost_price: produto?.cost_price?.toString().replace('.', ',') || '',
    purchase_date: produto?.purchase_date || new Date().toISOString().split('T')[0],
    current_stock: produto?.current_stock?.toString() || '',
    min_stock: produto?.min_stock?.toString() || '',
    category_id: produto?.category_id?.toString() || '',
    supplier_id: produto?.supplier_id?.toString() || '',
    colecao_id: produto?.colecao_id || '',
    collection: produto?.collection || '',
    is_active: produto?.is_active ?? true,
    is_featured: produto?.is_featured ?? false,
  });

  const [productImages, setProductImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<{ file: File; url: string }[]>([]);
  const [loadingSku, setLoadingSku] = useState(false);
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [transferModalAberto, setTransferModalAberto] = useState(false);

  // Initial Stock Destination
  const [sellers, setSellers] = useState<UserModel[]>([]);
  const [initialSellerId, setInitialSellerId] = useState<string>('');

  const inventory = useInventory(produto?.id);

  // Quick Category
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const loadProductImages = useCallback(async (productId: number) => {
    try {
      const images = await imagesService.getProductImages(productId);
      setProductImages(images.map((img) => img.url));
    } catch (err) {
      console.error('Erro ao carregar imagens:', err);
    }
  }, []);

  // Carrega categorias e coleções ao montar o componente
  useEffect(() => {
    loadCategories(true); // Apenas categorias ativas
    loadCollections(true); // Apenas coleções ativas
    loadSuppliers(); // Carregar fornecedores para o dropdown

    // Carregar revendedores se for produto novo
    if (!produto?.id) {
      usersService
        .getSellers()
        .then((data) => setSellers(data.filter((s) => s.is_active)))
        .catch((err) => console.error('Erro ao carregar revendedores:', err));
    }
  }, [loadCategories, loadCollections, loadSuppliers, produto?.id]);

  useEffect(() => {
    if (produto?.id) {
      loadProductImages(produto.id);
      inventory.loadStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produto?.id, loadProductImages]);

  async function handleQuickAddCategory() {
    if (!newCategoryName.trim()) return;
    try {
      setCreatingCategory(true);
      const newCat = await categoriesService.create({
        name: newCategoryName.trim(),
        is_active: true,
      });
      await loadCategories(true);
      setForm((prev) => ({ ...prev, category_id: newCat.id.toString() }));
      setNewCategoryName('');
      setShowQuickCategory(false);
    } catch (err) {
      console.error('Erro ao criar categoria rápida:', err);
    } finally {
      setCreatingCategory(false);
    }
  }

  const handleSkuLookup = async () => {
    const sku = form.sku.trim();

    // Skip if empty or if we're editing (produto.id exists)
    if (!sku || produto?.id) return;

    setLoadingSku(true);
    try {
      // Search for product by SKU
      const result = await productsService.getAll(1, 1, undefined, sku);

      if (result.data.length > 0) {
        const foundProduct = result.data[0];

        // Exact SKU match (case-insensitive)
        if (foundProduct.sku?.toLowerCase() === sku.toLowerCase()) {
          setExistingProduct(foundProduct);

          // Auto-fill ALL fields
          setForm({
            name: foundProduct.name,
            sku: foundProduct.sku || '',
            sku2: foundProduct.sku2 || '',
            short_description: foundProduct.short_description || '',
            description: foundProduct.description || '',
            price: foundProduct.price?.toString().replace('.', ',') || '',
            preco_promocional: foundProduct.preco_promocional?.toString().replace('.', ',') || '',
            cost_price: foundProduct.cost_price?.toString().replace('.', ',') || '',
            purchase_date: foundProduct.purchase_date || new Date().toISOString().split('T')[0],
            current_stock: '0', // Reset to 0 so user enters amount to ADD
            min_stock: foundProduct.min_stock?.toString() || '',
            category_id: foundProduct.category_id?.toString() || '',
            supplier_id: foundProduct.supplier_id?.toString() || '',
            colecao_id: foundProduct.colecao_id || '',
            collection: foundProduct.collection || '',
            is_active: foundProduct.is_active ?? true,
            is_featured: foundProduct.is_featured ?? false,
          });

          // Load images
          if (foundProduct.id) {
            await loadProductImages(foundProduct.id);
          }
        } else {
          setExistingProduct(null);
        }
      } else {
        setExistingProduct(null);
      }
    } catch (err) {
      console.error('Erro ao buscar SKU:', err);
      setExistingProduct(null);
    } finally {
      setLoadingSku(false);
    }
  };

  async function handleImageUpload(file: File, url: string): Promise<void> {
    if (!produto?.id) {
      setPendingFiles((prev) => [...prev, { file, url }]);
      setProductImages((prev) => [...prev, url]);
      return;
    }

    setUploadingImages(true);
    try {
      const realUrl = await imagesService.uploadImage(produto.id, file);
      await imagesService.registerImage(produto.id, realUrl, productImages.length);
      setProductImages((prev) => [...prev, realUrl]);
    } catch (err: unknown) {
      console.error('Erro ao fazer upload:', err);
      throw err;
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleImageRemove(url: string) {
    if (!produto?.id) {
      setProductImages((prev) => prev.filter((img) => img !== url));
      setPendingFiles((prev) => prev.filter((item) => item.url !== url));
      return;
    }

    try {
      const images = await imagesService.getProductImages(produto.id);
      const image = images.find((img) => img.url === url);
      if (image) {
        await imagesService.deleteImage(produto.id, image.id);
        setProductImages((prev) => prev.filter((img) => img !== url));
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;
    let finalValue = value;

    // SKU to Uppercase
    if (name === 'sku' || name === 'sku2') {
      finalValue = value.toUpperCase();
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : finalValue,
    }));
  }

  function handlePriceFieldChange(
    field: 'cost_price' | 'price' | 'preco_promocional',
    value: string,
  ) {
    setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationErrors({});

    const errors: Record<string, string> = {};

    // Basic Validations
    if (!form.name.trim()) errors.name = 'Nome é obrigatório';
    if (!form.sku.trim()) errors.sku = 'SKU é obrigatório';
    if (!form.price) errors.price = 'Preço de venda é obrigatório';

    const priceNum = parseCurrencyBR(form.price);
    const promoPriceNum = form.preco_promocional ? parseCurrencyBR(form.preco_promocional) : undefined;
    const costPriceNum = form.cost_price ? parseCurrencyBR(form.cost_price) : undefined;

    if (priceNum <= 0) {
      errors.price = 'O preço de venda deve ser maior que zero';
    }

    if (promoPriceNum !== undefined && promoPriceNum >= priceNum) {
      errors.preco_promocional = 'O preço promocional deve ser menor que o preço de venda';
    }

    if (parseInt(form.current_stock) < 0) {
      errors.current_stock = 'O estoque não pode ser negativo';
    }

    if (parseInt(form.min_stock) < 0) {
      errors.min_stock = 'O estoque mínimo não pode ser negativo';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // New: Check for images if active or featured
    if ((form.is_active || form.is_featured) && productImages.length === 0 && pendingFiles.length === 0) {
      if (
        !confirm(
          'Deseja salvar este produto sem imagens? Ele está marcado como Ativo/Destaque e pode não aparecer corretamente no site.',
        )
      ) {
        return;
      }
    }

    const produtoData = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      sku2: form.sku2.trim() || undefined,
      short_description: form.short_description.trim(),
      description: form.description.trim() || undefined,
      price: priceNum,
      preco_promocional: promoPriceNum,
      cost_price: costPriceNum,
      purchase_date: form.purchase_date,
      current_stock: parseInt(form.current_stock) || 0,
      min_stock: parseInt(form.min_stock) || 0,
      category_id: form.category_id ? parseInt(form.category_id) : undefined,
      supplier_id: form.supplier_id ? parseInt(form.supplier_id) : undefined,
      colecao_id: form.colecao_id || undefined,
      collection: form.collection.trim() || undefined,
      is_active: form.is_active,
      is_featured: form.is_featured,
      pendingFiles: pendingFiles.map((p) => p.file),
      existingProductId: existingProduct?.id,
      initial_seller_id: initialSellerId ? parseInt(initialSellerId) : undefined,
    };

    onSave(produtoData);
  }

  async function handleSalvarTransferencia(data: {
    from_user_id: number | null;
    to_user_id: number | null;
    quantity: number;
    notes?: string;
  }) {
    try {
      await inventory.transferStock(data);
      setTransferModalAberto(false);
      await inventory.loadStock();
    } catch {
      // Erro já tratado pelo hook
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-2xl font-playfair font-bold text-zinc-900">
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {error && <ErrorMessage message={error} className="mb-4" />}

          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            <ProductIdentificationSection
              form={form}
              onChange={handleChange}
              onSkuBlur={handleSkuLookup}
              validationErrors={validationErrors}
              loadingSku={loadingSku}
              existingProduct={existingProduct}
              produto={produto}
              stock={inventory.stock}
              loadingStock={inventory.loadingStock}
              onOpenTransfer={() => setTransferModalAberto(true)}
            />

            <ProductDetailsSection form={form} onChange={handleChange} validationErrors={validationErrors} />

            <ProductPricingSection
              form={form}
              validationErrors={validationErrors}
              onPriceFieldChange={handlePriceFieldChange}
            />

            <ProductOrganizationSection
              form={form}
              onChange={handleChange}
              validationErrors={validationErrors}
              produto={produto}
              existingProduct={existingProduct}
              categories={categories}
              suppliers={suppliers}
              sellers={sellers}
              initialSellerId={initialSellerId}
              onInitialSellerIdChange={setInitialSellerId}
              showQuickCategory={showQuickCategory}
              onToggleQuickCategory={setShowQuickCategory}
              newCategoryName={newCategoryName}
              onNewCategoryNameChange={setNewCategoryName}
              creatingCategory={creatingCategory}
              onQuickAddCategory={handleQuickAddCategory}
            />

            <ProductImagesAndToggles
              form={form}
              onChange={handleChange}
              productImages={productImages}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              disabled={loading || uploadingImages}
            />
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50 rounded-b-xl flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-white transition font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading}
            className="px-6 py-2 bg-(--lumike-gold) text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </div>

      {transferModalAberto && produto && (
        <TransferStockModal
          produto={produto}
          stockInfo={inventory.stock}
          onClose={() => setTransferModalAberto(false)}
          onSave={handleSalvarTransferencia}
          loading={inventory.transferring}
        />
      )}
    </div>
  );
}
