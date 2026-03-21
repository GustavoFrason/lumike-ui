'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2, Package, User, ShoppingBag, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import {
  warrantiesService,
  CreateWarrantyDto,
  WarrantyOrigin,
} from '@/lib/services/warranties.service';

interface WarrantyModalProps {
  onClose: () => void;
  onSave: () => void;
  initialData?: Partial<CreateWarrantyDto>;
}

export function WarrantyModal({ onClose, onSave, initialData }: WarrantyModalProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    initialData?.customer_id || null,
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    initialData?.order_id || null,
  );
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    initialData?.product_id || null,
  );
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [form, setForm] = useState<Partial<CreateWarrantyDto>>({
    type: initialData?.type || 'other',
    origin: initialData?.origin || 'sold',
    description: initialData?.description || '',
  });

  // Load product details when product selected
  useEffect(() => {
    if (!selectedProductId) {
      setSelectedProduct(null);
      return;
    }
    const loadProductDetails = async () => {
      try {
        const { data } = await api.get(`/products/${selectedProductId}`);
        setSelectedProduct(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadProductDetails();
  }, [selectedProductId]);

  // Search customers
  useEffect(() => {
    if (search.length < 3 || form.origin === 'stock') return;
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/customers?q=${search}`);
        setCustomers(data.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, form.origin]);

  // Load customer orders/products when customer selected
  useEffect(() => {
    if (!selectedCustomerId || form.origin === 'stock') return;
    const loadCustomerData = async () => {
      try {
        const { data } = await api.get(`/orders?customer_id=${selectedCustomerId}`);
        setOrders(data.data || []);

        // If we have an order_id from initialData, it helps filter
        const { data: pData } = await api.get('/products?limit=100');
        setProducts(pData.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadCustomerData();
  }, [selectedCustomerId, form.origin]);

  // Load all products if origin is stock
  useEffect(() => {
    if (form.origin !== 'stock') return;
    const loadAllProducts = async () => {
      try {
        const { data: pData } = await api.get('/products?limit=200&is_active=true');
        setProducts(pData.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadAllProducts();
  }, [form.origin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.origin === 'sold' && !selectedCustomerId) {
      alert('Por favor, selecione um cliente.');
      return;
    }
    if (!selectedProductId) {
      alert('Por favor, selecione um produto.');
      return;
    }

    setLoading(true);
    try {
      await warrantiesService.create({
        customer_id: form.origin === 'sold' ? selectedCustomerId || undefined : undefined,
        product_id: selectedProductId,
        order_id: form.origin === 'sold' ? selectedOrderId || undefined : undefined,
        origin: form.origin as WarrantyOrigin,
        type: form.type as any,
        description: form.description,
      });
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar concerto/garantia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b bg-zinc-50">
          <div>
            <h2 className="text-xl font-semibold font-serif text-zinc-900">
              Registrar Concerto / Garantia
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Acompanhamento e rastreabilidade de peças para manutenção.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Origin Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                Origem do Concerto
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-all ${form.origin === 'sold' ? 'bg-primary-gold text-white border-primary-gold shadow-md' : 'bg-white text-zinc-600 hover:border-zinc-300'}`}
                  onClick={() => setForm({ ...form, origin: 'sold' })}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium text-sm">Venda (Cliente)</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-all ${form.origin === 'stock' ? 'bg-primary-gold text-white border-primary-gold shadow-md' : 'bg-white text-zinc-600 hover:border-zinc-300'}`}
                  onClick={() => setForm({ ...form, origin: 'stock' })}
                >
                  <Package className="h-4 w-4" />
                  <span className="font-medium text-sm">Estoque Próprio</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conditional Customer/Order Selection */}
              {form.origin === 'sold' && (
                <div className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-3 w-3" /> Dados da Cliente
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-700">Buscar Cliente</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Nome, CPF ou WhatsApp..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-gold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={!!initialData?.customer_id}
                      />
                    </div>
                    {customers.length > 0 && !selectedCustomerId && (
                      <div className="absolute z-20 w-64 bg-white border rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                        {customers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-sm border-b last:border-0"
                            onClick={() => {
                              setSelectedCustomerId(c.id);
                              setSearch(c.name);
                              setCustomers([]);
                            }}
                          >
                            <span className="font-medium">{c.name}</span>
                            <span className="block text-[10px] text-zinc-400">
                              {c.phone || c.email}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-700">
                      Pedido Origem (Opcional)
                    </label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-gold bg-white"
                      value={selectedOrderId || ''}
                      onChange={(e) => setSelectedOrderId(Number(e.target.value))}
                      disabled={!selectedCustomerId || !!initialData?.order_id}
                    >
                      <option value="">Selecione o pedido...</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          Pedido #{o.id} - {new Date(o.created_at).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Product Selection */}
              <div
                className={`space-y-4 p-4 rounded-xl border border-zinc-100 ${form.origin === 'stock' ? 'md:col-span-2' : ''} bg-zinc-50`}
              >
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Package className="h-3 w-3" /> Identificação do Produto
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-700">Produto</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-gold bg-white"
                    required
                    value={selectedProductId || ''}
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                    disabled={!!initialData?.product_id}
                  >
                    <option value="">Selecione o produto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Preview Card */}
                {selectedProduct && (
                  <div className="flex bg-white p-3 rounded-lg border border-zinc-200 shadow-sm gap-4 animate-in fade-in slide-in-from-left-2">
                    <div className="h-20 w-20 bg-zinc-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-100">
                      {selectedProduct.images && selectedProduct.images.length > 0 ? (
                        <img
                          src={selectedProduct.images[0].url}
                          alt={selectedProduct.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-zinc-300" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-zinc-900 text-sm">{selectedProduct.name}</h4>
                      <span className="text-xs text-zinc-500 font-mono">
                        SKU: {selectedProduct.sku}
                      </span>
                      <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full w-fit mt-1">
                        Estoque Atual: {selectedProduct.current_stock}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Defect Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Tipo de Problema</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-gold bg-white"
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                >
                  <option value="plating">Banho (Ouro/Ródio)</option>
                  <option value="break">Peça Quebrada</option>
                  <option value="stone_loss">Queda de Pedras</option>
                  <option value="other">Outros</option>
                </select>
              </div>

              {/* Order Status Preview */}
              <div className="space-y-2 flex flex-col justify-end">
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-[11px] text-amber-800 leading-tight">
                    <strong>Nota:</strong> Peças em concerto continuam aparecendo no estoque mas são
                    sinalizadas como "Em Reparo".
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">
                Descrição Detalhada do Defeito
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-gold min-h-[100px] text-sm"
                placeholder="Descreva detalhadamente o problema..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="p-6 border-t bg-zinc-50 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary-gold text-white px-8" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <ShoppingBag className="h-4 w-4 mr-2" />
              )}
              Registrar Concerto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
