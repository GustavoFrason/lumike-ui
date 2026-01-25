'use client';

import { useState, useEffect } from 'react';
import { useProducts } from '@/lib/hooks/use-products';
import { useInventory } from '@/lib/hooks/use-inventory';
import { DataTable, Column } from '@/components/ui/data-table';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { StatusBadge } from '@/components/ui/status-badge';
import { StockMovementModal } from './StockMovementModal';
import { Package, TrendingUp, TrendingDown } from 'lucide-react';
import { Product } from '@/lib/services/products.service';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export default function EstoquePage() {
  const { products, loadingProducts, loadProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<'entry' | 'exit' | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const inventory = useInventory(selectedProduct?.id);

  useEffect(() => {
    loadProducts(1, 100, true);
  }, [loadProducts]);

  const filteredProducts = onlyLowStock
    ? products.filter(p => p.current_stock <= p.min_stock)
    : products;

  useEffect(() => {
    if (selectedProduct?.id) {
      inventory.loadHistory();
      inventory.loadStock();
    }
  }, [selectedProduct?.id, inventory]);

  function handleNovaMovimentacao(type: 'entry' | 'exit', product: Product) {
    setSelectedProduct(product);
    setMovementType(type);
    setModalAberto(true);
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
      await loadProducts(1, 100, true); // Atualiza lista de produtos
    } catch {
      // Erro já é tratado pelo hook
    }
  }

  const productColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Produto',
      render: (produto) => <span className="font-medium">{produto.name}</span>,
    },
    {
      key: 'stock',
      header: 'Estoque Atual',
      render: (produto) => (
        <div>
          <span
            className={
              produto.current_stock <= produto.min_stock
                ? 'text-red-600 font-semibold'
                : 'text-zinc-700'
            }
          >
            {produto.current_stock}
          </span>
          {produto.min_stock > 0 && (
            <span className="text-zinc-400 text-xs ml-1">
              (mín: {produto.min_stock})
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (produto) => (
        <StatusBadge
          status={
            produto.current_stock <= produto.min_stock ? 'pending' : 'active'
          }
          label={
            produto.current_stock <= produto.min_stock
              ? 'Estoque Baixo'
              : 'Normal'
          }
        />
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'text-right',
      render: (produto) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleNovaMovimentacao('entry', produto)}
            className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
          >
            <TrendingUp className="h-4 w-4" />
            Entrada
          </button>
          <button
            onClick={() => handleNovaMovimentacao('exit', produto)}
            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
          >
            <TrendingDown className="h-4 w-4" />
            Saída
          </button>
          <button
            onClick={() => setSelectedProduct(produto)}
            className="text-[var(--lumike-gold)] hover:underline text-sm"
          >
            Histórico
          </button>
        </div>
      ),
    },
  ];


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
        <h1 className="text-2xl font-semibold">Gestão de Estoque</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600 font-medium cursor-pointer" onClick={() => setOnlyLowStock(!onlyLowStock)}>
            Apenas Estoque Baixo:
          </label>
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              onlyLowStock ? "bg-red-600" : "bg-zinc-200"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                onlyLowStock ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      <ErrorMessage
        message={
          inventory.errorAdding ||
          inventory.errorRemoving ||
          inventory.errorHistory ||
          ''
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Produtos */}
        <div className="lg:col-span-2">
          <DataTable
            data={filteredProducts}
            loading={loadingProducts}
            columns={productColumns}
            emptyTitle={onlyLowStock ? "Nenhum produto com estoque baixo" : "Nenhum produto encontrado"}
            emptyDescription={
              onlyLowStock
                ? "Parabéns! Todos os seus produtos estão com níveis de estoque saudáveis."
                : "Cadastre produtos para gerenciar o estoque e as movimentações."
            }
            emptyAction={
              onlyLowStock && (
                <button
                  onClick={() => setOnlyLowStock(false)}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition"
                >
                  Ver Todos os Produtos
                </button>
              )
            }
          />
        </div>

        {/* Histórico do Produto Selecionado */}
        <div className="lg:col-span-1">
          {selectedProduct ? (
            <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selectedProduct.name}</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>

              {inventory.stock && (
                <div className="mb-4 p-3 bg-[var(--lumike-beige)] rounded-lg">
                  <p className="text-sm text-zinc-600">Estoque Atual</p>
                  <p className="text-2xl font-bold text-[var(--lumike-gold)]">
                    {inventory.stock.quantidade}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-zinc-700 mb-2">
                  Histórico Recente
                </h3>
                {inventory.loadingHistory ? (
                  <Loading size="sm" />
                ) : inventory.history.length > 0 ? (
                  <div className="space-y-2">
                    {inventory.history.slice(0, 5).map((movement) => (
                      <div
                        key={movement.id}
                        className="flex flex-col gap-1 p-3 bg-zinc-50 rounded border border-zinc-100"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className={cn(
                              "font-bold",
                              movement.movement === 'IN' ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {movement.movement === 'IN' ? '+' : '-'}
                            {Math.abs(movement.quantity)}
                          </span>
                          <span className="text-zinc-400 text-[10px]">
                            {formatDate(movement.created_at)}
                          </span>
                        </div>
                        {movement.reference && (
                          <p className="text-[11px] text-zinc-500 italic">
                            {movement.reference}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">Nenhuma movimentação</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 text-center text-zinc-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-zinc-400" />
              <p className="text-sm">Selecione um produto para ver o histórico</p>
            </div>
          )}
        </div>
      </div>

      {modalAberto && selectedProduct && movementType && (
        <StockMovementModal
          produto={selectedProduct}
          type={movementType}
          onClose={() => setModalAberto(false)}
          onSave={handleSalvarMovimentacao}
          loading={inventory.adding || inventory.removing}
        />
      )}
    </section>
  );
}

