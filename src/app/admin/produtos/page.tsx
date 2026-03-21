'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductModal } from './ProductModal';
import { useProducts } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { formatCurrency } from '@/lib/formatters';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Pagination } from '@/components/ui/pagination';
import { PaginationInfo } from '@/components/ui/pagination-info';
import { Product, UpdateProductDto, productsService } from '@/lib/services/products.service';
import { imagesService } from '@/lib/services/images.service';
import { Search, Filter } from 'lucide-react';
import { WarrantyModal } from '../garantias/WarrantyModal';

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
  const [warrantyProduct, setWarrantyProduct] = useState<Product | null>(null);
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

  async function handleSalvar(produtoData: UpdateProductDto) {
    const { pendingFiles, ...cleanData } = produtoData as any;

    try {
      if (produtoSelecionado?.id) {
        await updateProduct(produtoSelecionado.id, cleanData);
      } else {
        // Cria o produto e pega o resultado (que deve conter o ID)
        const newProduct = await createProduct(cleanData);

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
          className="px-4 py-2 bg-[var(--lumike-gold)] text-white rounded-lg hover:opacity-90 transition"
        >
          + Novo Produto
        </button>
      </div>

      <ErrorMessage
        message={errorProducts || errorCreating || errorUpdating || errorDeleting || ''}
      />

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--lumike-gold)] focus:border-transparent outline-none transition"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            className="w-full md:w-48 py-2 px-3 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--lumike-gold)] focus:border-transparent outline-none transition bg-white text-zinc-700"
            value={categoryId || ''}
            onChange={(e) => {
              setCategoryId(e.target.value ? Number(e.target.value) : undefined);
              setCurrentPage(1);
            }}
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-zinc-100 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <span className="text-sm font-medium text-zinc-700">
            {selectedIds.length} produtos selecionados
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatus(true)}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
            >
              Ativar Selecionados
            </button>
            <button
              onClick={() => handleBulkStatus(false)}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
            >
              Desativar Selecionados
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1 bg-zinc-400 text-white text-xs rounded hover:bg-zinc-500 transition"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      <DataTable
        data={products}
        loading={loadingProducts}
        columns={[
          {
            key: 'selection',
            header: (
              <input
                type="checkbox"
                checked={selectedIds.length === products.length && products.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-zinc-300 text-[var(--lumike-gold)] focus:ring-[var(--lumike-gold)]"
              />
            ),
            render: (produto) => (
              <input
                type="checkbox"
                checked={selectedIds.includes(produto.id)}
                onChange={() => toggleSelect(produto.id)}
                className="rounded border-zinc-300 text-[var(--lumike-gold)] focus:ring-[var(--lumike-gold)]"
              />
            ),
            className: 'w-10',
          },
          {
            key: 'id',
            header: 'ID',
            render: (produto) => (
              <span className="text-zinc-500 text-xs font-mono">#{produto.id}</span>
            ),
            className: 'w-16',
          },
          {
            key: 'name',
            header: 'Nome',
            render: (produto) => <span className="font-medium">{produto.name}</span>,
          },
          {
            key: 'sku',
            header: 'SKU / SKU2',
            render: (produto) => (
              <div className="flex flex-col">
                <span className="text-zinc-700 font-mono text-sm">{produto.sku || '-'}</span>
                {produto.sku2 && (
                  <span className="text-zinc-400 text-xs font-mono">{produto.sku2}</span>
                )}
              </div>
            ),
          },
          {
            key: 'price',
            header: 'Preço',
            render: (produto) =>
              produto.preco_promocional ? (
                <div>
                  <span className="line-through text-zinc-400">
                    {formatCurrency(produto.price)}
                  </span>
                  <span className="ml-2 text-[var(--lumike-gold)] font-semibold">
                    {formatCurrency(produto.preco_promocional)}
                  </span>
                </div>
              ) : (
                formatCurrency(produto.price)
              ),
          },
          {
            key: 'stock',
            header: 'Estoque',
            render: (produto) => (
              <div>
                <span
                  className={
                    produto.current_stock <= produto.min_stock ? 'text-red-600 font-semibold' : ''
                  }
                >
                  {produto.current_stock}
                </span>
                {produto.min_stock > 0 && (
                  <span className="text-zinc-400 text-xs ml-1">(mín: {produto.min_stock})</span>
                )}
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (produto) => <StatusBadge status={produto.is_active} />,
          },
          {
            key: 'actions',
            header: 'Ações',
            className: 'text-right',
            render: (produto) => (
              <ActionButtons
                onEdit={() => handleEditar(produto)}
                onDelete={() => handleExcluir(produto.id)}
                onRepair={() => {
                  setRepairProduto(produto);
                  setShowWarrantyModal(true);
                }}
                disabled={updating || deleting}
              />
            ),
          },
        ]}
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
              className="px-4 py-2 bg-[var(--lumike-gold)] text-white rounded-lg hover:opacity-90 transition"
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
