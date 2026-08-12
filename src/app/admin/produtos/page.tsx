'use client';

import { useState, useEffect } from 'react';
import { ProductModal } from './ProductModal';
import { useProducts } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { PaginationInfo } from '@/components/ui/pagination-info';
import { Product, CreateProductDto, productsService } from '@/lib/services/products.service';
import { imagesService } from '@/lib/services/images.service';
import { inventoryService } from '@/lib/services/inventory.service';
import { WarrantyModal } from '../garantias/WarrantyModal';
import { ProductFiltersBar } from './components/ProductFiltersBar';
import { BulkActionsBar } from './components/BulkActionsBar';
import { getProductColumns } from './components/product-columns';

const ITEMS_PER_PAGE = 20;

export default function ProdutosPage() {
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

  // Carrega produtos ao montar o componente ou mudar página/filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(currentPage, ITEMS_PER_PAGE, true, search, categoryId);
    }, 300);

    return () => clearTimeout(timer);
  }, [loadProducts, currentPage, search, categoryId]);

  async function handleBulkStatus(is_active: boolean) {
    if (selectedIds.length === 0) return;
    try {
      await productsService.bulkUpdateStatus(selectedIds, is_active);
      setSelectedIds([]);
      await loadProducts(currentPage, ITEMS_PER_PAGE, true);
    } catch (err) {
      console.error('Erro ao atualizar em massa:', err);
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

  async function handleSalvar(
    produtoData: Partial<Product> & { pendingFiles?: File[]; initial_seller_id?: number },
  ) {
    const { pendingFiles, initial_seller_id, ...cleanData } = produtoData;

    try {
      if (produtoSelecionado?.id) {
        await updateProduct(produtoSelecionado.id, cleanData);
      } else {
        // Lógica de estoque inicial
        const originalStock = Number(cleanData.current_stock) || 0;
        if (initial_seller_id && originalStock > 0) {
          cleanData.current_stock = 0; // Se vai para vendedor, cria com 0 no central
        }

        // ProductModal valida os campos obrigatórios antes de chamar onSave
        // (é o mesmo contrato usado em compras/nova/page.tsx pro cadastro
        // rápido), então em tempo de execução isso sempre bate com
        // CreateProductDto.
        const newProduct = await createProduct(cleanData as CreateProductDto);

        // Se houver revendedor inicial, aloca o saldo
        if (newProduct?.id && initial_seller_id && originalStock > 0) {
          try {
            await inventoryService.addStock(
              newProduct.id,
              { quantity: originalStock, reference: 'Estoque inicial da peça' },
              initial_seller_id,
            );
          } catch (err) {
            console.error('Erro ao registrar estoque inicial:', err);
          }
        }

        // Se houver imagens pendentes e o produto foi criado com sucesso
        if (newProduct?.id && pendingFiles && pendingFiles.length > 0) {
          console.log(
            `🚀 Iniciando upload de ${pendingFiles.length} imagens para o produto ${newProduct.id}`,
          );
          for (let i = 0; i < pendingFiles.length; i++) {
            try {
              const file = pendingFiles[i];
              console.log(`📸 Processando imagem ${i + 1}/${pendingFiles.length}:`, {
                name: file?.name,
                type: file?.type,
                size: file?.size,
                isBlob: file instanceof Blob,
              });

              if (!file || !(file instanceof File)) {
                console.error(
                  `❌ Imagem ${i + 1} inválida ou não é um arquivo (File), pulando upload.`,
                );
                continue;
              }

              const url = await imagesService.uploadImage(newProduct.id, file as File);
              await imagesService.registerImage(newProduct.id, url, i);
            } catch (imgErr) {
              console.error('Erro ao subir imagem durante criação:', imgErr);
            }
          }
        }
      }
      setModalAberto(false);
      await loadProducts(currentPage, ITEMS_PER_PAGE, true); // Recarrega a lista
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  async function handleExcluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await deleteProduct(id);
      await loadProducts(currentPage, ITEMS_PER_PAGE, true); // Recarrega a lista
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  if (loadingProducts) {
    return (
      <section className="space-y-6">
        <Loading size="lg" text="Carregando produtos..." className="py-12" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <button
          onClick={handleNovoProduto}
          className="px-4 py-2 bg-[var(--lumilee-gold)] text-white rounded-lg hover:opacity-90 transition"
        >
          + Novo Produto
        </button>
      </div>

      <ErrorMessage
        message={errorProducts || errorCreating || errorUpdating || errorDeleting || ''}
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
        loading={loadingProducts}
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
            alert('Enviado para concerto com sucesso!');
          }}
        />
      )}
    </section>
  );
}
