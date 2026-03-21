'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, productsService } from '@/lib/services/products.service';
import { categoriesService } from '@/lib/services/categories.service';
import { ImageUpload } from '@/components/ui/image-upload';
import { imagesService } from '@/lib/services/images.service';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCollections } from '@/lib/hooks/use-collections';
import { useSuppliers } from '@/lib/hooks/use-suppliers';
import { Plus, Check, X, Info, Truck } from 'lucide-react';
import CurrencyInput from 'react-currency-input-field';

import { ErrorMessage } from '@/components/ui/error-message';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ModalProps {
  produto: Product | null;
  onClose: () => void;
  onSave: (produto: Partial<Product> & { pendingFiles?: File[] }) => void;
  loading?: boolean;
  error?: string | null;
}

interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  children?: React.ReactNode;
}

function LabelWithTooltip({ label, tooltip, required, children }: LabelWithTooltipProps) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="block text-sm font-medium text-zinc-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-zinc-400 hover:text-(--lumike-gold) cursor-help transition-colors" />
          </TooltipTrigger>
          <TooltipContent className="bg-zinc-800 text-zinc-50 border-zinc-700 max-w-xs">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {children}
    </div>
  );
}

export function ProductModal({ produto, onClose, onSave, loading = false, error }: ModalProps) {
  const { categories, loadCategories, loadingCategories } = useCategories();
  const { collections, loadCollections, loadingCollections } = useCollections();
  const { suppliers, loadSuppliers } = useSuppliers();

  const [form, setForm] = useState({
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

  // Removed variants loader

  // Carrega categorias e coleções ao montar o componente
  useEffect(() => {
    loadCategories(true); // Apenas categorias ativas
    loadCollections(true); // Apenas coleções ativas
    loadSuppliers(); // Carregar fornecedores para o dropdown
  }, [loadCategories, loadCollections, loadSuppliers]);

  useEffect(() => {
    if (produto?.id) {
      loadProductImages(produto.id);
    }
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
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const produtoData = {
      name: form.name,
      sku: form.sku || undefined,
      sku2: form.sku2 || undefined,
      short_description: form.short_description,
      description: form.description || undefined,
      price: parseFloat(form.price.replace(/\./g, '').replace(',', '.')) || 0,
      preco_promocional: form.preco_promocional
        ? parseFloat(form.preco_promocional.replace(/\./g, '').replace(',', '.'))
        : undefined,
      cost_price: form.cost_price
        ? parseFloat(form.cost_price.replace(/\./g, '').replace(',', '.'))
        : undefined,
      purchase_date: form.purchase_date,
      current_stock: parseInt(form.current_stock) || 0,
      min_stock: parseInt(form.min_stock) || 0,
      category_id: form.category_id ? parseInt(form.category_id) : undefined,
      supplier_id: form.supplier_id ? parseInt(form.supplier_id) : undefined,
      colecao_id: form.colecao_id || undefined,
      collection: form.collection || undefined,
      is_active: form.is_active,
      is_featured: form.is_featured,
      pendingFiles: pendingFiles.map((p) => p.file),
      existingProductId: existingProduct?.id,
    };

    onSave(produtoData);
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
            {/* --- Identificação --- */}
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-4">
              <h3 className="font-semibold text-zinc-800 flex items-center gap-2">
                📦 Identificação e Estoque
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <LabelWithTooltip
                    label="SKU (Principal)"
                    tooltip="Código único do produto impresso na etiqueta (Code 128)."
                    required
                  >
                    {loadingSku && <span className="ml-2 text-xs text-zinc-400">Buscando...</span>}
                  </LabelWithTooltip>
                  <input
                    type="text"
                    name="sku"
                    placeholder="Ex: AN1234"
                    value={form.sku}
                    onChange={handleChange}
                    onBlur={handleSkuLookup}
                    className="w-full border-2 border-(--lumike-gold)/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumike-gold) outline-none font-mono font-medium"
                    required
                    autoFocus
                  />
                  {existingProduct && (
                    <div className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded mt-1 border border-amber-200">
                      ⚠ Produto existente. O valor abaixo será somado ao estoque atual.
                    </div>
                  )}
                </div>

                <div>
                  <LabelWithTooltip
                    label="SKU Zarpellon (Opcional)"
                    tooltip="Código de referência da planilha da Zarpellon (SKU2)."
                  />
                  <input
                    type="text"
                    name="sku2"
                    placeholder="Ex: 102030"
                    value={form.sku2}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 font-mono text-zinc-600"
                  />
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
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* --- Detalhes Principais --- */}
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
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 font-medium"
                    required
                  />
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
                      onChange={handleChange}
                      maxLength={40}
                      className="w-full border rounded-lg px-3 py-2 pr-12"
                      required
                    />
                    <span className="absolute right-3 top-2 text-xs text-zinc-400 pointer-events-none">
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
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* --- Financeiro --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50/50 p-4 rounded-lg border border-green-100">
              <div>
                <LabelWithTooltip
                  label="Preço de Custo"
                  tooltip="Valor pago ao fornecedor. Usado para cálculo de lucro."
                />
                <CurrencyInput
                  name="cost_price"
                  placeholder="R$ 0,00"
                  value={form.cost_price}
                  decimalsLimit={2}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, cost_price: value || '' }))
                  }
                  prefix="R$ "
                  className="w-full border rounded-lg px-3 py-2"
                  decimalSeparator=","
                  groupSeparator="."
                  intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                />
              </div>

              <div>
                <LabelWithTooltip
                  label="Preço de Venda"
                  tooltip="Valor final para o cliente."
                  required
                />
                <CurrencyInput
                  name="price"
                  placeholder="R$ 0,00"
                  value={form.price}
                  decimalsLimit={2}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, price: value || '' }))}
                  prefix="R$ "
                  className="w-full border rounded-lg px-3 py-2 font-bold text-zinc-800"
                  decimalSeparator=","
                  groupSeparator="."
                  intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                  required
                />
              </div>

              <div>
                <LabelWithTooltip
                  label="Preço Promocional"
                  tooltip="Se preenchido, aparecerá como 'De/Por' no site."
                />
                <CurrencyInput
                  name="preco_promocional"
                  placeholder="R$ 0,00"
                  value={form.preco_promocional}
                  decimalsLimit={2}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, preco_promocional: value || '' }))
                  }
                  prefix="R$ "
                  className="w-full border rounded-lg px-3 py-2 text-green-700 font-medium"
                  decimalSeparator=","
                  groupSeparator="."
                  intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                />
              </div>
            </div>

            {/* --- Organização --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <LabelWithTooltip
                    label="Categoria"
                    tooltip="Grupo onde este produto será exibido (ex: Anéis, Colares)."
                  />
                  {!showQuickCategory && (
                    <button
                      type="button"
                      onClick={() => setShowQuickCategory(true)}
                      className="text-xs text-(--lumike-gold) hover:underline flex items-center gap-1"
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
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                      className="p-1 text-green-600 bg-green-50 rounded hover:bg-green-100"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickCategory(false);
                        setNewCategoryName('');
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
                    onChange={handleChange}
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
                  onChange={handleChange}
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <LabelWithTooltip
                    label="Estoque Inicial"
                    tooltip="Quantidade atual em estoque."
                  />
                  <input
                    type="number"
                    name="current_stock"
                    placeholder="0"
                    min="0"
                    value={form.current_stock}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-center font-mono ${existingProduct ? 'bg-amber-100 border-amber-300' : ''}`}
                    required
                  />
                </div>
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
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* --- Imagens --- */}
            <div>
              <LabelWithTooltip
                label="Imagens do Produto"
                tooltip="Fotos do produto. A primeira será a capa."
              />
              <ImageUpload
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
                existingImages={productImages}
                maxImages={10}
                disabled={loading || uploadingImages}
              />
            </div>

            {/* --- Toggles --- */}
            <div className="flex flex-col sm:flex-row gap-6 p-4 bg-zinc-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-zinc-300 text-(--lumike-gold) focus:ring-(--lumike-gold)"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-800">Destaque</span>
                  <span className="text-xs text-zinc-500">Aparece na Home</span>
                </div>
              </label>
            </div>
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
    </div>
  );
}
