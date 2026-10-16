'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useCategories } from '@/lib/hooks/use-categories';
import { DataTable } from '@/components/ui/data-table';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { Pagination } from '@/components/ui/pagination';
import { PaginationInfo } from '@/components/ui/pagination-info';
import { StockMovementModal } from './StockMovementModal';
import { TransferStockModal } from './TransferStockModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { ArrowLeftRight, User as UserIcon } from 'lucide-react';
import { Product, productsService } from '@/lib/services/products.service';
import { inventoryService, SellerInventory } from '@/lib/services/inventory.service';
import { getErrorMessage } from '@/lib/utils';
import { getStockColumns } from './components/stock-columns';
import { ProductStockDetailPanel } from './components/ProductStockDetailPanel';
import { StockFiltersBar } from './components/StockFiltersBar';
import {
  buildStockRows,
  EMPTY_STOCK_FILTERS,
  filterStockRows,
  hasActiveStockFilters,
  StockFilters,
  StockRow,
} from './components/stock-rows';
import { notify } from '@/components/ui/notify';

const ITEMS_PER_PAGE = 25;

export default function EstoquePage() {
  const { categories } = useCategories();

  // Catálogo inteiro + estoque das revendedoras: os filtros rodam na tela
  // (status e total = Central + revendedoras não são colunas do banco).
  // Antes só os 100 primeiros produtos eram carregados.
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<SellerInventory[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadProgress, setLoadProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  const [filters, setFilters] = useState<StockFilters>(EMPTY_STOCK_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState<StockRow | null>(null);
  const [movementType, setMovementType] = useState<'entry' | 'exit' | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [transferModalAberto, setTransferModalAberto] = useState(false);
  const [adjustmentModalAberto, setAdjustmentModalAberto] = useState(false);

  const inventory = useInventory(selectedProduct?.id);

  /**
   * Busca produtos e estoque das revendedoras. Na 1ª carga mostra o
   * progresso; nas recargas (depois de uma movimentação) atualiza em
   * silêncio, sem desmontar a tela — filtros e página continuam.
   */
  const loadStock = useCallback(async (showProgress: boolean) => {
    setErrorProducts(null);
    try {
      const [allProducts, allSellers] = await Promise.all([
        productsService.getAllPages(
          { isActive: true, sort: 'code' },
          showProgress ? (loaded, total) => setLoadProgress({ loaded, total }) : undefined,
        ),
        inventoryService.getAllSellersStock(),
      ]);
      setProducts(allProducts);
      setSellers(allSellers);
    } catch (err) {
      setErrorProducts(getErrorMessage(err, 'Erro ao carregar o estoque.'));
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadStock(true);
  }, [loadStock]);

  const rows = useMemo(() => buildStockRows(products, sellers), [products, sellers]);
  const filteredRows = useMemo(() => filterStockRows(rows, filters), [rows, filters]);
  const filtersActive = hasActiveStockFilters(filters);

  // Depois de uma recarga o filtro pode ter menos páginas que a atual.
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const pageRows = filteredRows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleFiltersChange(next: StockFilters) {
    setFilters(next);
    setCurrentPage(1);
  }

  function handleClearFilters() {
    handleFiltersChange(EMPTY_STOCK_FILTERS);
  }

  const { loadHistory, loadStock: loadProductStock } = inventory;

  useEffect(() => {
    if (selectedProduct?.id) {
      loadHistory();
      loadProductStock();
    }
  }, [selectedProduct?.id, loadHistory, loadProductStock]);

  /** Recarrega painel de detalhes + tabela depois de mexer no estoque. */
  async function refreshAfterChange() {
    await inventory.loadHistory();
    await inventory.loadStock();
    await loadStock(false);
  }

  function handleNovaMovimentacao(type: 'entry' | 'exit', product: StockRow) {
    setSelectedProduct(product);
    setMovementType(type);
    setModalAberto(true);
  }

  function handleTransferencia(product: Product) {
    setSelectedProduct(rows.find((r) => r.id === product.id) ?? null);
    setTransferModalAberto(true);
  }

  async function handleSalvarMovimentacao(quantity: number, reference?: string) {
    if (!selectedProduct) return;

    try {
      if (movementType === 'entry') {
        await inventory.addStock({ quantity, reference });
      } else {
        await inventory.removeStock({ quantity, reference });
      }
      setModalAberto(false);
      await refreshAfterChange();
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  async function handleSalvarTransferencia(data: {
    from_user_id: number | null;
    to_user_id: number | null;
    quantity: number;
    notes?: string;
  }) {
    if (!selectedProduct) return;

    try {
      await inventory.transferStock(data);
      setTransferModalAberto(false);
      await refreshAfterChange();
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  async function handleSalvarConferencia(data: {
    user_id: number | null;
    counted_quantity: number;
    reason: string;
  }) {
    if (!selectedProduct) return;

    try {
      const result = await inventory.adjustFromCount(data);
      setAdjustmentModalAberto(false);
      await refreshAfterChange();
      if (result && result.delta !== 0) {
        notify.success(
          `Estoque ajustado: diferença de ${result.delta > 0 ? '+' : ''}${result.delta} unidade(s).`,
        );
      }
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  if (loadingProducts) {
    return (
      <section className="space-y-6">
        <Loading
          size="lg"
          text={
            loadProgress
              ? `Carregando produtos... ${loadProgress.loaded} de ${loadProgress.total}`
              : 'Carregando produtos...'
          }
          className="py-12"
        />
      </section>
    );
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif text-zinc-900 font-medium">Gestão de Estoque</h1>
        <p className="text-zinc-500 mt-1">
          Monitore e transfira mercadorias entre estoque Lumilee e revendedores
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2">
          <Link
            href="/admin/estoque/revendedores"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-(--lumilee-gold) hover:underline"
          >
            <UserIcon className="h-3.5 w-3.5" /> Ver inventário por revendedora
          </Link>
          <Link
            href="/admin/estoque/transferencias"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-(--lumilee-gold) hover:underline"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" /> Transferências em lote
          </Link>
        </div>
      </div>

      <ErrorMessage
        message={
          errorProducts ||
          inventory.errorAdding ||
          inventory.errorRemoving ||
          inventory.errorHistory ||
          inventory.errorTransferring ||
          ''
        }
      />

      <StockFiltersBar
        filters={filters}
        onChange={handleFiltersChange}
        onClear={handleClearFilters}
        categories={categories}
        sellers={sellers}
        shownCount={filteredRows.length}
        totalCount={rows.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Produtos */}
        <div className="lg:col-span-2 space-y-4">
          <DataTable
            data={pageRows}
            columns={getStockColumns({
              onEntry: (produto) => handleNovaMovimentacao('entry', produto),
              onExit: (produto) => handleNovaMovimentacao('exit', produto),
              onTransfer: handleTransferencia,
              onAdjust: (produto) => {
                setSelectedProduct(produto);
                setAdjustmentModalAberto(true);
              },
              onSelect: setSelectedProduct,
            })}
            emptyTitle={
              filtersActive ? 'Nenhum produto corresponde aos filtros' : 'Nenhum produto encontrado'
            }
            emptyDescription={
              filtersActive
                ? 'Tente ajustar ou limpar os filtros.'
                : 'Cadastre produtos para gerenciar o estoque.'
            }
            emptyAction={
              filtersActive ? (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition"
                >
                  Limpar Filtros
                </button>
              ) : undefined
            }
          />

          {filteredRows.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between pt-2">
              <PaginationInfo
                currentPage={page}
                totalItems={filteredRows.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>

        {/* Detalhes e Distribuição */}
        <div className="lg:col-span-1 space-y-6">
          <ProductStockDetailPanel
            selectedProduct={selectedProduct}
            inventory={inventory}
            onClose={() => setSelectedProduct(null)}
            onTransfer={handleTransferencia}
          />
        </div>
      </div>

      {/* Modais */}
      {modalAberto && selectedProduct && movementType && (
        <StockMovementModal
          produto={selectedProduct}
          type={movementType}
          onClose={() => setModalAberto(false)}
          onSave={handleSalvarMovimentacao}
          loading={inventory.adding || inventory.removing}
        />
      )}

      {transferModalAberto && selectedProduct && (
        <TransferStockModal
          produto={selectedProduct}
          stockInfo={inventory.stock}
          onClose={() => setTransferModalAberto(false)}
          onSave={handleSalvarTransferencia}
          loading={inventory.transferring}
        />
      )}

      {adjustmentModalAberto && selectedProduct && (
        <StockAdjustmentModal
          produto={selectedProduct}
          stockInfo={inventory.stock}
          onClose={() => setAdjustmentModalAberto(false)}
          onSave={handleSalvarConferencia}
          loading={inventory.adjusting}
        />
      )}
    </section>
  );
}
