'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { ProductModal, type ProductModalSaveData } from './ProductModal';
import { useProducts } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { ErrorMessage } from '@/components/ui/error-message';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { PaginationInfo } from '@/components/ui/pagination-info';
import { Product, CreateProductDto, productsService } from '@/lib/services/products.service';
import { imagesService } from '@/lib/services/images.service';
import { inventoryService } from '@/lib/services/inventory.service';
import { exportProductsToExcel } from '@/lib/utils/export-products';
import { getErrorMessage } from '@/lib/utils';
import { WarrantyModal } from '../garantias/WarrantyModal';
import { ProductFiltersBar } from './components/ProductFiltersBar';
import { BulkActionsBar } from './components/BulkActionsBar';
import { getProductColumns } from './components/product-columns';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { notify } from '@/components/ui/notify';

const ITEMS_PER_PAGE = 20;

export default function ProdutosPage() {
  const { confirm, confirmDialog } = useConfirm();
  const {
    products,
    pagination,
    loadingProducts,
    errorProducts,
    loadProducts,
    creating,
    errorCreating,
    createProduct,
    updating,
    errorUpdating,
    updateProduct,
    deleting,
    errorDeleting,
    deleteProduct,
  } = useProducts();

  const { categories } = useCategories();

  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // State for WarrantyModal
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [repairProduto, setRepairProduto] = useState<Product | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Espera a pessoa parar de digitar antes de buscar (digitar devagar não
  // dispara uma busca por número).
  const [debouncedSearch] = useDebounce(search, 400);

  // Lista em ordem crescente do número do item (sort=code). Usado no
  // carregamento e nas recargas depois de salvar/excluir/ações em massa,
  // sempre com a busca e a categoria atuais.
  const reload = useCallback(
    () => loadProducts(currentPage, ITEMS_PER_PAGE, true, debouncedSearch, categoryId, 'code'),
    [loadProducts, currentPage, debouncedSearch, categoryId],
  );

  useEffect(() => {
    reload().catch(() => {
      // Erro já é tratado pelo hook
    });
  }, [reload]);

  async function handleBulkStatus(is_active: boolean) {
    if (selectedIds.length === 0) return;
    try {
      await productsService.bulkUpdateStatus(selectedIds, is_active);
      setSelectedIds([]);
      await reload();
    } catch (err) {
      console.error('Erro ao atualizar em massa:', err);
    }
  }

  /**
   * Busca TODOS os produtos que batem com os filtros atuais (busca/
   * categoria) — a paginação da tela (ITEMS_PER_PAGE) é só de exibição.
   * getAllPages pagina de 1000 em 1000 (teto do Supabase por requisição).
   * Mesmo is_active=true já usado pra carregar a tela (não tem toggle de
   * "mostrar inativos" nesta tela hoje).
   */
  async function handleExportExcel() {
    setExporting(true);
    setExportError(null);
    try {
      const allProducts = await productsService.getAllPages({
        isActive: true,
        search,
        categoryId,
        sort: 'code',
      });
      exportProductsToExcel(allProducts);
    } catch (err) {
      setExportError(getErrorMessage(err, 'Erro ao exportar produtos.'));
    } finally {
      setExporting(false);
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  }

  function handleNovoProduto() {
    setProdutoSelecionado(null);
    setModalAberto(true);
  }

  function handleEditar(produto: Product) {
    setProdutoSelecionado(produto);
    setModalAberto(true);
  }

  /** Sobe as imagens escolhidas antes do produto existir (cadastro novo). */
  async function uploadPendingImages(productId: number, pendingFiles?: File[]) {
    if (!pendingFiles || pendingFiles.length === 0) return;

    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i];
      if (!file || !(file instanceof File)) {
        console.error(`Imagem ${i + 1} inválida (não é um arquivo), pulando upload.`);
        continue;
      }
      try {
        const url = await imagesService.uploadImage(productId, file);
        await imagesService.registerImage(productId, url, i);
      } catch (imgErr) {
        console.error('Erro ao subir imagem durante criação:', imgErr);
      }
    }
  }

  async function handleSalvar(produtoData: ProductModalSaveData) {
    const { pendingFiles, initial_seller_id, existingProductId, ...cleanData } = produtoData;

    try {
      if (produtoSelecionado?.id) {
        await updateProduct(produtoSelecionado.id, cleanData);
      } else if (existingProductId) {
        // Produto já cadastrado (achado pelo código Zarpellon no modal):
        // atualiza os dados e lança a quantidade digitada como ENTRADA de
        // estoque. Antes o `existingProductId` ia junto pro create e a API
        // recusava (400) — o "somar ao estoque" nunca funcionou.
        const quantityToAdd = Number(cleanData.current_stock) || 0;
        const { current_stock: _quantityTyped, ...fields } = cleanData;
        await updateProduct(existingProductId, fields);

        if (quantityToAdd > 0) {
          await inventoryService.addStock(
            existingProductId,
            { quantity: quantityToAdd, reference: 'Entrada pelo cadastro de produto' },
            initial_seller_id ?? null,
          );
        }

        await uploadPendingImages(existingProductId, pendingFiles);
      } else {
        // Estoque inicial entra como MOVIMENTO (entrada no Central e, se
        // houver, transferência pra revendedora) — não direto no campo do
        // produto. Gravar current_stock na criação só mexia no número
        // exibido: o controle por localidade ficava zerado e a 1ª venda
        // dava "estoque insuficiente". A transferência também fica
        // registrada pro acerto com a revendedora.
        const initialStock = Number(cleanData.current_stock) || 0;
        cleanData.current_stock = 0;

        // ProductModal valida os campos obrigatórios antes de chamar onSave
        // (é o mesmo contrato usado em compras/nova/page.tsx pro cadastro
        // rápido), então em tempo de execução isso sempre bate com
        // CreateProductDto.
        const newProduct = await createProduct(cleanData as CreateProductDto);

        if (newProduct?.id && initialStock > 0) {
          try {
            await inventoryService.addStock(newProduct.id, {
              quantity: initialStock,
              reference: 'Estoque inicial da peça',
            });
            if (initial_seller_id) {
              await inventoryService.transfer(newProduct.id, {
                from_user_id: null,
                to_user_id: initial_seller_id,
                quantity: initialStock,
                notes: 'Estoque inicial para a revendedora',
              });
            }
          } catch (err) {
            console.error('Erro ao registrar estoque inicial:', err);
          }
        }

        // Se houver imagens pendentes e o produto foi criado com sucesso
        if (newProduct?.id) {
          await uploadPendingImages(newProduct.id, pendingFiles);
        }
      }
      setModalAberto(false);
      await reload(); // Recarrega a lista mantendo busca/categoria
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  async function handleExcluir(id: number) {
    if (
      !(await confirm({
        title: 'Excluir este produto?',
        confirmLabel: 'Excluir',
        destructive: true,
      }))
    ) {
      return;
    }

    try {
      await deleteProduct(id);
      await reload(); // Recarrega a lista mantendo busca/categoria
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  // Sem early-return de "Carregando...": ele desmontava a página inteira
  // (inclusive o campo de busca) a cada busca, e a pessoa perdia o foco a
  // cada número digitado. O skeleton da tabela só aparece na 1ª carga.
  const isSearching = loadingProducts && products.length > 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <div className="flex items-center gap-2">
          {/* Exporta TODOS os produtos que batem com busca/categoria atuais
              (ignora a paginação da tela) com todas as colunas do produto,
              não só o que aparece na tabela — ver export-products.ts. */}
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exportando...' : 'Exportar Excel'}
          </button>
          <button
            onClick={handleNovoProduto}
            className="px-4 py-2 bg-[var(--lumilee-gold)] text-white rounded-lg hover:opacity-90 transition"
          >
            + Novo Produto
          </button>
        </div>
      </div>

      <ErrorMessage
        message={
          errorProducts || errorCreating || errorUpdating || errorDeleting || exportError || ''
        }
      />

      <ProductFiltersBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        categoryId={categoryId}
        onCategoryChange={(id) => {
          setCategoryId(id);
          setCurrentPage(1);
        }}
        categories={categories}
        searching={isSearching}
      />

      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          onActivate={() => handleBulkStatus(true)}
          onDeactivate={() => handleBulkStatus(false)}
          onClear={() => setSelectedIds([])}
        />
      )}

      <DataTable
        data={products}
        loading={loadingProducts && products.length === 0}
        columns={getProductColumns({
          selectedIds,
          allSelected: selectedIds.length === products.length && products.length > 0,
          onToggleSelect: toggleSelect,
          onToggleSelectAll: toggleSelectAll,
          onEdit: handleEditar,
          onDelete: handleExcluir,
          onRepair: (produto) => {
            setRepairProduto(produto);
            setShowWarrantyModal(true);
          },
          actionsDisabled: updating || deleting,
        })}
        emptyTitle={
          search || categoryId
            ? 'Nenhum produto corresponde aos filtros'
            : 'Nenhum produto cadastrado'
        }
        emptyDescription={
          search || categoryId
            ? 'Tente ajustar seus termos de busca ou filtros para encontrar o que procura.'
            : 'Comece criando seu primeiro produto para gerenciar seu catálogo.'
        }
        emptyAction={
          search || categoryId ? (
            <button
              onClick={() => {
                setSearch('');
                setCategoryId(undefined);
              }}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition"
            >
              Limpar Filtros
            </button>
          ) : (
            <button
              onClick={handleNovoProduto}
              className="px-4 py-2 bg-[var(--lumilee-gold)] text-white rounded-lg hover:opacity-90 transition"
            >
              Criar Primeiro Produto
            </button>
          )
        }
      />

      {pagination && pagination.total > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-4">
          <PaginationInfo
            currentPage={currentPage}
            totalItems={pagination.total}
            itemsPerPage={ITEMS_PER_PAGE}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(pagination.total / ITEMS_PER_PAGE)}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {modalAberto && (
        <ProductModal
          produto={produtoSelecionado}
          onClose={() => setModalAberto(false)}
          onSave={handleSalvar}
          loading={creating || updating}
          error={errorCreating || errorUpdating}
        />
      )}

      {showWarrantyModal && repairProduto && (
        <WarrantyModal
          initialData={{
            product_id: repairProduto.id,
            origin: 'stock',
          }}
          onClose={() => {
            setShowWarrantyModal(false);
            setRepairProduto(null);
          }}
          onSave={() => {
            setShowWarrantyModal(false);
            setRepairProduto(null);
            notify.success('Enviado para concerto com sucesso!');
          }}
        />
      )}
      {confirmDialog}
    </section>
  );
}
