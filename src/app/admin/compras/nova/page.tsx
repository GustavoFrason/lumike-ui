'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/lib/hooks/use-products';
import { useSuppliers } from '@/lib/hooks/use-suppliers';
import { useCategories } from '@/lib/hooks/use-categories';
import { purchasesService, CreatePurchaseDto } from '@/lib/services/purchases.service';
import { CreateProductDto, Product } from '@/lib/services/products.service';
import { ErrorMessage } from '@/components/ui/error-message';
import { getErrorMessage } from '@/lib/utils';
import { ProductModal } from '../../produtos/ProductModal';
import { imagesService } from '@/lib/services/images.service';
import { FileSpreadsheet, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { PurchaseItem } from './components/types';
import { SupplierSelector } from './components/SupplierSelector';
import { ProductQuickSearch } from './components/ProductQuickSearch';
import { PurchaseItemsList } from './components/PurchaseItemsList';
import { PurchaseSummary } from './components/PurchaseSummary';
import { ExcelImporter } from './components/excel-importer/ExcelImporter';
import { ConfirmImportResult } from './components/excel-importer/types';

export default function NovaCompraPage() {
  const router = useRouter();
  const { products, loadProducts } = useProducts();
  const { suppliers, loadSuppliers } = useSuppliers();
  const { categories, loadCategories } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | ''>('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Quick Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const { createProduct, creating: creatingProduct, errorCreating } = useProducts();

  // Import de planilha Excel (Zarpellon)
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);

  useEffect(() => {
    loadProducts(1, 1000, true);
    loadSuppliers(1, 1000);
    loadCategories(true); // só ativas, mesmo padrão do ProductModal/admin/categorias
  }, [loadProducts, loadSuppliers, loadCategories]);

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku2?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .slice(0, 10);

  function addItem(product: Product) {
    const existing = items.find((item) => item.product.id === product.id);
    if (existing) {
      setItems(
        items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      setItems([...items, { product, quantity: 1, unit_cost: product.cost_price || 0 }]);
    }
  }

  function removeItem(productId: number) {
    setItems(items.filter((item) => item.product.id !== productId));
  }

  function updateItem(productId: number, field: 'quantity' | 'unit_cost', value: number) {
    if (field === 'quantity' && value < 1) return;
    setItems(
      items.map((item) => (item.product.id === productId ? { ...item, [field]: value } : item)),
    );
  }

  function handleExcelImportConfirm(result: ConfirmImportResult) {
    setIsExcelImporterOpen(false);
    // A compra já foi persistida (produtos + estoque) direto pelo backend —
    // essa tela só precisa refletir o catálogo atualizado, não empilhar os
    // itens importados na lista de "Itens da Compra" (que é outra compra,
    // ainda não salva).
    loadProducts(1, 1000, true);
    setSuccess(
      `Planilha importada! ${result.created} produto(s) novo(s) e ${result.updated} entrada(s) de estoque.`,
    );
    setTimeout(() => setSuccess(null), 5000);
  }

  async function handleQuickProductSave(produtoData: Partial<Product> & { pendingFiles?: File[] }) {
    try {
      setError(null);
      // ProductModal valida os campos obrigatórios antes de chamar onSave,
      // então em tempo de execução isso sempre bate com CreateProductDto —
      // o cast aqui é só porque o tipo do modal é Partial<Product> (cobre
      // tanto criar quanto editar).
      const newProduct = await createProduct(produtoData as CreateProductDto);

      if (newProduct) {
        // Handle images if any
        if (produtoData.pendingFiles && produtoData.pendingFiles.length > 0) {
          for (let i = 0; i < produtoData.pendingFiles.length; i++) {
            const file = produtoData.pendingFiles[i];
            const url = await imagesService.uploadImage(newProduct.id, file);
            await imagesService.registerImage(newProduct.id, url, i);
          }
        }

        // Add to purchase items
        setItems((prev) => [
          ...prev,
          { product: newProduct, quantity: 1, unit_cost: produtoData.cost_price || 0 },
        ]);

        setIsProductModalOpen(false);
        setSearchTerm('');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar produto rápido'));
      console.error(err);
    }
  }

  const total = items.reduce((sum, item) => sum + item.unit_cost * item.quantity, 0);

  async function handleFinalizar() {
    if (items.length === 0 || !selectedSupplierId) {
      setError('Selecione um fornecedor e adicione pelo menos um item.');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const payload: CreatePurchaseDto = {
        supplier_id: Number(selectedSupplierId),
        notes,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
        })),
      };

      await purchasesService.create(payload);
      router.push('/admin/compras');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao registrar compra'));
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compras" className="text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Registrar Entrada de Lote (Compra)
          </h1>
        </div>
        <button
          onClick={() => setIsExcelImporterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition shadow-sm font-medium"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Importar Planilha (Zarpellon)
        </button>
      </div>

      <ErrorMessage message={error || ''} />

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <SupplierSelector
            suppliers={suppliers}
            selectedSupplierId={selectedSupplierId}
            onSelectSupplier={setSelectedSupplierId}
          />

          <ProductQuickSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            products={filteredProducts}
            onAddProduct={addItem}
            onOpenCreateModal={() => setIsProductModalOpen(true)}
          />

          <PurchaseItemsList items={items} onUpdateItem={updateItem} onRemoveItem={removeItem} />
        </div>

        <div className="space-y-4">
          <PurchaseSummary
            items={items}
            total={total}
            notes={notes}
            onNotesChange={setNotes}
            onFinalizar={handleFinalizar}
            creating={creating}
            disabled={items.length === 0 || !selectedSupplierId || creating}
          />
        </div>
      </div>

      {/* Quick Create Product Modal */}
      {isProductModalOpen && (
        <ProductModal
          produto={searchTerm ? { name: searchTerm, sku2: searchTerm.toUpperCase() } : null}
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleQuickProductSave}
          loading={creatingProduct}
          error={errorCreating}
        />
      )}

      {/* Excel Importer Modal Overlay */}
      {isExcelImporterOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="w-full max-w-6xl">
            <ExcelImporter
              categories={categories}
              onConfirm={handleExcelImportConfirm}
              onCancel={() => setIsExcelImporterOpen(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
