'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/lib/hooks/use-products';
import { useSuppliers } from '@/lib/hooks/use-suppliers';
import { purchasesService, CreatePurchaseDto } from '@/lib/services/purchases.service';
import { Product } from '@/lib/services/products.service';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { formatCurrency } from '@/lib/formatters';
import { Search, Plus, Trash, Save, ArrowLeft, Package, User } from 'lucide-react';
import Link from 'next/link';
import CurrencyInput from 'react-currency-input-field';

interface PurchaseItem {
  product: Product;
  quantity: number;
  unit_cost: number;
}

export default function NovaCompraPage() {
  const router = useRouter();
  const { products, loadProducts } = useProducts();
  const { suppliers, loadSuppliers } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | ''>('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts(1, 1000, true);
    loadSuppliers(1, 1000);
  }, [loadProducts, loadSuppliers]);

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar compra');
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/compras" className="text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900">Registrar Entrada de Lote (Compra)</h1>
      </div>

      <ErrorMessage message={error || ''} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Fornecedor */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <label className="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-(--lumike-gold)" />
              Fornecedor
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value ? Number(e.target.value) : '')}
              className="w-full border rounded-lg px-4 py-2.5 bg-zinc-50 focus:ring-2 focus:ring-(--lumike-gold) outline-none"
              required
            >
              <option value="">Selecione um fornecedor...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Busca de Produtos */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <Package className="h-4 w-4 text-(--lumike-gold)" />
              Adicionar Produtos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar produto por nome ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-(--lumike-gold) outline-none text-lg"
              />
            </div>

            {searchTerm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      addItem(product);
                      setSearchTerm('');
                    }}
                    className="flex items-center gap-3 p-3 bg-zinc-50 border rounded-lg hover:border-(--lumike-gold) hover:bg-white transition text-left group"
                  >
                    <div className="w-12 h-12 bg-zinc-200 rounded flex items-center justify-center text-zinc-400 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-zinc-500">SKU: {product.sku || '-'}</p>
                    </div>
                    <Plus className="h-5 w-5 text-zinc-300 group-hover:text-(--lumike-gold)" />
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="col-span-2 text-center py-4 text-zinc-500">
                    Nenhum produto encontrado.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Lista de Itens */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-zinc-50">
              <h3 className="font-semibold text-zinc-800">Itens da Compra</h3>
            </div>
            <div className="divide-y">
              {items.length === 0 ? (
                <div className="p-12 text-center text-zinc-400">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhum item adicionado à compra.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900">{item.product.name}</p>
                      <p className="text-xs text-zinc-500">SKU: {item.product.sku}</p>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Qtd
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.product.id, 'quantity', Number(e.target.value))
                          }
                          className="w-full border rounded px-2 py-1.5 focus:ring-1 focus:ring-(--lumike-gold) outline-none"
                          min="1"
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Custo Unit.
                        </label>
                        <CurrencyInput
                          value={item.unit_cost}
                          onValueChange={(val) =>
                            updateItem(item.product.id, 'unit_cost', parseFloat(val || '0'))
                          }
                          prefix="R$ "
                          className="w-full border rounded px-2 py-1.5 focus:ring-1 focus:ring-(--lumike-gold) outline-none"
                          intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                        />
                      </div>
                      <div className="text-right min-w-[100px]">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Subtotal
                        </label>
                        <span className="font-semibold text-zinc-900">
                          {formatCurrency(item.unit_cost * item.quantity)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-400 hover:text-red-600 p-1 mt-5"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-lg sticky top-6">
            <h3 className="text-lg font-bold text-zinc-800 mb-6 border-b pb-4">Resumo da Compra</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-zinc-600">
                <span>Total de Itens</span>
                <span className="font-medium">{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold text-zinc-900 pt-4 border-t">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 block mb-1">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-(--lumike-gold) outline-none"
                  placeholder="Detalhes sobre a entrega, fatura, etc..."
                />
              </div>

              <button
                onClick={handleFinalizar}
                disabled={items.length === 0 || !selectedSupplierId || creating}
                className="w-full py-4 bg-(--lumike-gold) text-white rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-100 transition"
              >
                {creating ? (
                  <Loading size="sm" spinnerClassName="text-white" />
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Salvar Compra</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
