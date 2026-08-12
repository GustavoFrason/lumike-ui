'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/lib/hooks/use-products';
import { ordersService, CreateOrderDto } from '@/lib/services/orders.service';
import { Product } from '@/lib/services/products.service';
import { Customer } from '@/lib/services/customers.service';
import { ErrorMessage } from '@/components/ui/error-message';
import { Loading } from '@/components/ui/loading';
import { formatCurrency, parseCurrencyBR } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/utils';
import { Save, ArrowLeft } from 'lucide-react';
import { usersService, User } from '@/lib/services/users.service';
import { ScannerModal } from '@/components/scanner-modal';
import Link from 'next/link';
import { CartItem, PaymentMethod, PaymentStatus } from './components/types';
import { usePosBeeper } from './components/use-pos-beeper';
import { ProductSearchGrid } from './components/ProductSearchGrid';
import { CartPanel } from './components/CartPanel';
import { CustomerSellerSection } from './components/CustomerSellerSection';
import { PaymentSection } from './components/PaymentSection';

export default function NovaVendaPage() {
  const router = useRouter();
  const { products, loadingProducts, loadProducts } = useProducts();
  const { playBeep, playErrorBeep } = usePosBeeper();

  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Customer & Seller
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sellers, setSellers] = useState<User[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null); // comissão, não mexe em estoque
  const [stockLocationUserId, setStockLocationUserId] = useState<number | null>(null); // null = Estoque Central

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pago');

  // Boca Details
  const [bocaValue, setBocaValue] = useState(''); // Valor que ficará pendente
  const [bocaPaidNow, setBocaPaidNow] = useState(''); // Valor pago agora (parcial)
  const [bocaNotes, setBocaNotes] = useState('');

  // Card Details
  const [cardBrand, setCardBrand] = useState('visa');
  const [transactionId, setTransactionId] = useState(''); // só modo "cartao" (à vista)
  const [cardTax, setCardTax] = useState('');
  const [installments, setInstallments] = useState(1); // só modo "parcelado"

  useEffect(() => {
    loadProducts(1, 200, true);

    usersService.getSellers().then((data) => {
      setSellers(data);
    });

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Atalhos Globais
      if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('pos-search-input')?.focus();
      }
      if (e.key === 'F8') {
        e.preventDefault();
        // Focar busca de cliente se houver ID ou classe
        document.querySelector<HTMLInputElement>('.customer-search-input')?.focus();
      }
      if (e.key === 'F12') {
        e.preventDefault();
        if (cart.length > 0 && !creating) {
          handleFinalizar();
        }
      }
      if (e.key === 'Escape') {
        if (cart.length > 0 && confirm('Limpar carrinho?')) {
          setCart([]);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, creating, loadProducts]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku2?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function tryAutoAdd(term: string) {
    if (!term) return;
    const match = products.find((p) => p.sku?.toLowerCase() === term.toLowerCase());
    if (match) {
      addToCart(match);
      setSearchTerm('');
      playBeep();
      return true;
    }
    // Match SKU2
    const matchSku2 = products.find((p) => p.sku2?.toLowerCase() === term.toLowerCase());
    if (matchSku2) {
      addToCart(matchSku2);
      setSearchTerm('');
      playBeep();
      return true;
    }
    // Match ID
    const matchId = products.find((p) => p.id.toString() === term);
    if (matchId) {
      addToCart(matchId);
      setSearchTerm('');
      playBeep();
      return true;
    }

    // Se chegou aqui e tem algo digitado, é porque falhou
    if (term) playErrorBeep();
    return false;
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      tryAutoAdd(searchTerm);
    }
  }

  function handleCameraScan(code: string) {
    tryAutoAdd(code);
  }

  function addToCart(product: Product) {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  }

  function removeFromCart(productId: number) {
    setCart(cart.filter((item) => item.product.id !== productId));
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity < 1) return;
    setCart(cart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  }

  const total = cart.reduce((sum, item) => {
    const price = item.product.preco_promocional || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Até 10x, nunca deixando a parcela cair abaixo de R$50 (mesma regra já
  // anunciada na vitrine — home-benefits-bar.tsx). Sempre ao menos 1x,
  // mesmo com o carrinho vazio/abaixo de R$50.
  const maxInstallments = Math.max(1, Math.min(10, Math.floor(total / 50)));

  useEffect(() => {
    // Carrinho mudou depois de já ter escolhido parcelas (ex: removeu
    // item e 6x deixou de caber na regra de R$50/parcela) — reduz pro
    // novo máximo em vez de deixar uma seleção que o backend rejeitaria.
    if (installments > maxInstallments) {
      setInstallments(maxInstallments);
    }
  }, [maxInstallments, installments]);

  function handleSellerChange(newSellerId: number | null) {
    // Só "segue" o vendedor se o Estoque de Origem ainda estiver
    // sincronizado com o vendedor atual (inclusive o caso inicial, os
    // dois em null = Central). Se você já tinha escolhido um Estoque de
    // Origem diferente de propósito (ex: comissão pra um vendedor, peça
    // saindo do Central), essa escolha manual não é sobrescrita.
    setStockLocationUserId((prevLocation) =>
      prevLocation === selectedSellerId ? newSellerId : prevLocation,
    );
    setSelectedSellerId(newSellerId);
  }

  function handlePaymentMethodChange(newMethod: PaymentMethod) {
    setPaymentMethod(newMethod);
    // Auto-ajustar status baseado no método
    if (newMethod === 'dinheiro' || newMethod === 'cartao' || newMethod === 'parcelado') {
      setPaymentStatus('pago');
    } else if ((newMethod === 'boca' || newMethod === 'aberto') && paymentStatus === 'pago') {
      setPaymentStatus('aberto');
    }

    // Auto-preencher valor pendente quando selecionar "boca"
    if (newMethod === 'boca') {
      setBocaValue(total.toFixed(2).replace('.', ','));
    }
  }

  function handleBocaPaidNowChange(value: string) {
    setBocaPaidNow(value);
    // Calcular automaticamente o valor pendente
    const paidAmount = parseCurrencyBR(value);
    const remaining = total - paidAmount;
    setBocaValue(remaining > 0 ? remaining.toFixed(2).replace('.', ',') : '0');
  }

  async function handleFinalizar() {
    if (cart.length === 0) return;

    // Validação: vendas "boca" ou "aberto" precisam de cliente
    if (
      (paymentMethod === 'boca' ||
        paymentMethod === 'aberto' ||
        paymentStatus === 'aberto' ||
        paymentStatus === 'parcial') &&
      !selectedCustomer
    ) {
      setError(
        '⚠️ Vendas fiadas ou em aberto precisam ter um cliente selecionado para rastreamento em "Clientes a Pagar"',
      );
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const payload: CreateOrderDto = {
        customer_id: selectedCustomer?.id,
        seller_id: selectedSellerId || undefined,
        stock_location_user_id: stockLocationUserId || undefined,
        notes,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        boca_details:
          paymentMethod === 'boca'
            ? {
                value: parseCurrencyBR(bocaValue),
                paid_now: paymentStatus === 'parcial' ? parseCurrencyBR(bocaPaidNow) : undefined,
                notes: bocaNotes,
              }
            : undefined,
        card_details:
          paymentMethod === 'cartao' || paymentMethod === 'parcelado'
            ? {
                brand: cardBrand,
                tax: parseCurrencyBR(cardTax),
                transaction_id: paymentMethod === 'cartao' ? transactionId : undefined,
                installments: paymentMethod === 'parcelado' ? installments : undefined,
              }
            : undefined,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.preco_promocional || item.product.price,
        })),
      };

      await ordersService.create(payload);
      router.push('/admin/vendas');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao criar venda'));
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/vendas" className="text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-semibold">Nova Venda (POS)</h1>
      </div>

      <ErrorMessage message={error || ''} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ProductSearchGrid
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          onOpenScanner={() => setIsScannerOpen(true)}
          loadingProducts={loadingProducts}
          products={filteredProducts}
          onAddToCart={addToCart}
        />

        {/* Coluna Direita: Carrinho e Checkout */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-lg sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <CustomerSellerSection
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              sellers={sellers}
              selectedSellerId={selectedSellerId}
              onSelectSeller={handleSellerChange}
              stockLocationUserId={stockLocationUserId}
              onSelectStockLocation={setStockLocationUserId}
            />

            <CartPanel
              cart={cart}
              total={total}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
            />

            <PaymentSection
              paymentMethod={paymentMethod}
              onPaymentMethodChange={handlePaymentMethodChange}
              paymentStatus={paymentStatus}
              onPaymentStatusChange={setPaymentStatus}
              bocaValue={bocaValue}
              onBocaValueChange={setBocaValue}
              bocaPaidNow={bocaPaidNow}
              onBocaPaidNowChange={handleBocaPaidNowChange}
              bocaNotes={bocaNotes}
              onBocaNotesChange={setBocaNotes}
              selectedCustomer={selectedCustomer}
              total={total}
              cardBrand={cardBrand}
              onCardBrandChange={setCardBrand}
              transactionId={transactionId}
              onTransactionIdChange={setTransactionId}
              cardTax={cardTax}
              onCardTaxChange={setCardTax}
              installments={installments}
              onInstallmentsChange={setInstallments}
              maxInstallments={maxInstallments}
              notes={notes}
              onNotesChange={setNotes}
            />
          </div>

          <button
            onClick={handleFinalizar}
            disabled={cart.length === 0 || creating}
            className="w-full py-4 bg-(--lumike-gold) text-white rounded-lg font-bold text-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
          >
            {creating ? (
              <Loading size="sm" spinnerClassName="text-white" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Finalizar {formatCurrency(total)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleCameraScan}
      />
    </section>
  );
}
