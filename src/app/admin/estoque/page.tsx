'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProducts } from '@/lib/hooks/use-products';
import { useInventory } from '@/lib/hooks/use-inventory';
import { DataTable } from '@/components/ui/data-table';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { StockMovementModal } from './StockMovementModal';
import { TransferStockModal } from './TransferStockModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { User as UserIcon } from 'lucide-react';
import { Product } from '@/lib/services/products.service';
import { cn } from '@/lib/utils';
import { getStockColumns } from './components/stock-columns';
import { ProductStockDetailPanel } from './components/ProductStockDetailPanel';

export default function EstoquePage() {
  const { products, loadingProducts, loadProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<'entry' | 'exit' | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [transferModalAberto, setTransferModalAberto] = useState(false);
  const [adjustmentModalAberto, setAdjustmentModalAberto] = useState(false);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const inventory = useInventory(selectedProduct?.id);

  useEffect(() => {
    loadProducts(1, 100, true);
  }, [loadProducts]);

  const filteredProducts = onlyLowStock
    ? products.filter((p) => p.current_stock <= p.min_stock)
    : products;

  const { loadHistory, loadStock } = inventory;

  useEffect(() => {
    if (selectedProduct?.id) {
      loadHistory();
      loadStock();
    }
  }, [selectedProduct?.id, loadHistory, loadStock]);

  function handleNovaMovimentacao(type: 'entry' | 'exit', product: Product) {
    setSelectedProduct(product);
    setMovementType(type);
    setModalAberto(true);
  }

  function handleTransferencia(product: Product) {
    setSelectedProduct(product);
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
      await inventory.loadHistory();
      await inventory.loadStock();
      await loadProducts(1, 100, true);
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
      await inventory.loadHistory();
      await inventory.loadStock();
      await loadProducts(1, 100, true);
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
      await inventory.loadHistory();
      await inventory.loadStock();
      await loadProducts(1, 100, true);
      if (result && result.delta !== 0) {
        alert(
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
        <Loading size="lg" text="Carregando produtos..." className="py-12" />
      </section>
    );
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-zinc-900 font-medium">Gestão de Estoque</h1>
          <p className="text-zinc-500 mt-1">
            Monitore e transfira mercadorias entre estoque Lumike e revendedores
          </p>
          <Link
            href="/admin/estoque/revendedores"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-(--lumike-gold) hover:underline mt-2"
          >
            <UserIcon className="h-3.5 w-3.5" /> Ver inventário por revendedora
          </Link>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-2">
            Filtrar:
          </label>
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all',
              onlyLowStock
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-zinc-50 text-zinc-500 border border-zinc-100 hover:bg-zinc-100',
            )}
          >
            Estoque Baixo
          </button>
        </div>
      </div>

      <ErrorMessage
        message={
          inventory.errorAdding ||
          inventory.errorRemoving ||
          inventory.errorHistory ||
          inventory.errorTransferring ||
          ''
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Produtos */}
        <div className="lg:col-span-2">
          <DataTable
            data={filteredProducts}
            loading={loadingProducts}
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
              onlyLowStock ? 'Nenhum produto com estoque baixo' : 'Nenhum produto encontrado'
            }
            emptyDescription={
              onlyLowStock
                ? 'Seu estoque está em dia!'
                : 'Cadastre produtos para gerenciar o estoque.'
            }
          />
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
