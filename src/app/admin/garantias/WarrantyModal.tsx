'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import {
  warrantiesService,
  CreateWarrantyDto,
  WarrantyOrigin,
} from '@/lib/services/warranties.service';
import { Customer } from '@/lib/services/customers.service';
import { Order } from '@/lib/services/orders.service';
import { Product } from '@/lib/services/products.service';
import { OriginToggle } from './components/OriginToggle';
import { CustomerOrderSection } from './components/CustomerOrderSection';
import { ProductSelectionSection } from './components/ProductSelectionSection';
import { DefectDetailsSection } from './components/DefectDetailsSection';

interface WarrantyModalProps {
  onClose: () => void;
  onSave: () => void;
  initialData?: Partial<CreateWarrantyDto>;
}

export function WarrantyModal({ onClose, onSave, initialData }: WarrantyModalProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    initialData?.customer_id || null,
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    initialData?.order_id || null,
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    initialData?.product_id || null,
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
        type: form.type || 'other',
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
            <OriginToggle
              origin={form.origin}
              onChange={(origin) => setForm({ ...form, origin })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {form.origin === 'sold' && (
                <CustomerOrderSection
                  search={search}
                  onSearchChange={setSearch}
                  customers={customers}
                  onSelectCustomer={(c) => {
                    setSelectedCustomerId(c.id);
                    setSearch(c.name);
                    setCustomers([]);
                  }}
                  selectedCustomerId={selectedCustomerId}
                  customerLocked={!!initialData?.customer_id}
                  orders={orders}
                  selectedOrderId={selectedOrderId}
                  onSelectOrder={setSelectedOrderId}
                  orderLocked={!!initialData?.order_id}
                />
              )}

              <ProductSelectionSection
                origin={form.origin}
                products={products}
                selectedProductId={selectedProductId}
                onSelectProduct={setSelectedProductId}
                productLocked={!!initialData?.product_id}
                selectedProduct={selectedProduct}
              />

              <DefectDetailsSection
                type={form.type}
                onTypeChange={(type) => setForm({ ...form, type })}
              />
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
