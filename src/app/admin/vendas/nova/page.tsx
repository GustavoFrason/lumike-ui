'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/lib/hooks/use-products';
import { ordersService, CreateOrderDto } from '@/lib/services/orders.service';
import { Product } from '@/lib/services/products.service';
import { Customer } from '@/lib/services/customers.service';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { formatCurrency } from '@/lib/formatters';
import {
  Search,
  Plus,
  Trash,
  Save,
  ArrowLeft,
  QrCode,
  CreditCard,
  Wallet,
  User as UserIcon,
} from 'lucide-react';
import { ScannerModal } from '@/components/scanner-modal';
import Link from 'next/link';
import Image from 'next/image';
import { CustomerSearch } from '@/components/sales/customer-search';
import CurrencyInput from 'react-currency-input-field';

interface CartItem {
  product: Product;
  quantity: number;
}

type PaymentMethod = 'dinheiro' | 'cartao' | 'parcelado' | 'boca' | 'aberto';
type PaymentStatus = 'pago' | 'parcial' | 'aberto';

export default function NovaVendaPage() {
  const router = useRouter();
  const { products, loadingProducts, loadProducts } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Customer
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pago');

  // Boca Details
  const [bocaValue, setBocaValue] = useState(''); // Valor que ficará pendente
  const [bocaPaidNow, setBocaPaidNow] = useState(''); // Valor pago agora (parcial)
  const [bocaNotes, setBocaNotes] = useState('');

  // Card Details
  const [cardBrand, setCardBrand] = useState('visa');
  const [transactionId, setTransactionId] = useState('');
  const [cardTax, setCardTax] = useState('');

  // Áudio
  const beepRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadProducts(1, 200, true);
    beepRef.current = new Audio('/sounds/beep.mp3');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    return false;
  }

  function playBeep() {
    try {
      if (beepRef.current) {
        beepRef.current.currentTime = 0;
        beepRef.current.play().catch(() => {
          // Fallback to oscillator if audio file play fails
          generateToneBeep();
        });
      } else {
        generateToneBeep();
      }
    } catch (e) {
      console.error('Beep error:', e);
    }
  }

  function generateToneBeep() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error('Oscillator beep error:', e);
    }
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
        notes,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        boca_details:
          paymentMethod === 'boca'
            ? {
                value: parseFloat(bocaValue.replace(/\./g, '').replace(',', '.')) || 0,
                paid_now:
                  paymentStatus === 'parcial'
                    ? parseFloat(bocaPaidNow.replace(/\./g, '').replace(',', '.')) || 0
                    : undefined,
                notes: bocaNotes,
              }
            : undefined,
        card_details:
          paymentMethod === 'cartao' || paymentMethod === 'parcelado'
            ? {
                brand: cardBrand,
                transaction_id: transactionId,
                tax: parseFloat(cardTax.replace(/\./g, '').replace(',', '.')) || 0,
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
      const message = err instanceof Error ? err.message : 'Erro ao criar venda';
      setError(message);
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
        {/* Coluna Esquerda: Produtos */}
        <div className="xl:col-span-2 space-y-4">
          {/* Barra de Busca */}
          <div className="bg-white p-4 rounded-lg border border-zinc-200 sticky top-4 z-10 shadow-sm">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar produto ou BIPAR código..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--lumike-gold) text-lg"
                />
              </div>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-4 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition flex items-center gap-2"
              >
                <QrCode className="h-5 w-5" />
                <span className="hidden md:inline">Ler Câmera</span>
              </button>
            </div>
          </div>

          {/* Lista de Produtos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
            {loadingProducts ? (
              <div className="col-span-2 text-center py-12">
                <Loading />
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-3 rounded-lg border hover:border-(--lumike-gold) transition flex gap-3 group relative cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="w-16 h-16 bg-zinc-100 rounded relative overflow-hidden shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        Sem foto
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <span>SKU: {product.sku || '-'}</span>
                      {product.sku2 && (
                        <span className="bg-zinc-100 px-1 rounded text-xs">{product.sku2}</span>
                      )}
                    </div>
                    <p className="text-(--lumike-gold) font-bold mt-1">
                      {formatCurrency(product.preco_promocional || product.price)}
                    </p>
                  </div>
                  <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition">
                    <Plus className="bg-(--lumike-gold) text-white p-1 h-6 w-6 rounded-full shadow-lg" />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-zinc-400">
                Nenhum produto encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Carrinho e Checkout */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-lg sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
            {/* Seção Cliente */}
            <div className="mb-6 border-b pb-4">
              <CustomerSearch onSelect={setSelectedCustomer} selectedCustomer={selectedCustomer} />
            </div>

            {/* Itens do Carrinho */}
            <div className="mb-6 max-h-[300px] overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
                  <div className="bg-zinc-100 p-3 rounded-full inline-block mb-2">
                    <Wallet className="h-6 w-6 text-zinc-400" />
                  </div>
                  <p className="text-zinc-500 text-sm">O carrinho está vazio</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 text-sm group">
                    <div className="w-10 h-10 bg-zinc-100 rounded relative overflow-hidden shrink-0">
                      {item.product.images?.[0]?.url && (
                        <Image
                          src={item.product.images[0].url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-zinc-500 text-xs">
                        {formatCurrency(item.product.preco_promocional || item.product.price)} x{' '}
                        {item.quantity}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-medium">
                        {formatCurrency(
                          (item.product.preco_promocional || item.product.price) * item.quantity,
                        )}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-1 text-zinc-400 hover:text-zinc-600"
                        >
                          -
                        </button>
                        <span className="text-xs w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-1 text-zinc-400 hover:text-zinc-600"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-1 text-red-400 hover:text-red-600"
                        >
                          <Trash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totais */}
            <div className="py-4 border-t border-b border-zinc-100 space-y-2 mb-6">
              <div className="flex justify-between items-center text-zinc-600">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-xl text-zinc-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Pagamento */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-zinc-500 mb-1 block">
                    Método
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const newMethod = e.target.value as PaymentMethod;
                      setPaymentMethod(newMethod);
                      // Auto-ajustar status baseado no método
                      if (
                        newMethod === 'dinheiro' ||
                        newMethod === 'cartao' ||
                        newMethod === 'parcelado'
                      ) {
                        setPaymentStatus('pago');
                      } else if (
                        (newMethod === 'boca' || newMethod === 'aberto') &&
                        paymentStatus === 'pago'
                      ) {
                        setPaymentStatus('aberto');
                      }

                      // Auto-preencher valor pendente quando selecionar "boca"
                      if (newMethod === 'boca') {
                        setBocaValue(total.toFixed(2).replace('.', ','));
                      }
                    }}
                    className="w-full border rounded p-2 text-sm bg-zinc-50 font-medium"
                  >
                    <option value="dinheiro">💵 Dinheiro</option>
                    <option value="cartao">💳 Cartão</option>
                    <option value="parcelado">📅 Parcelado</option>
                    <option value="boca">👄 Boca (Fiado)</option>
                    <option value="aberto">⏳ Em Aberto</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-zinc-500 mb-1 block">
                    Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    disabled={
                      paymentMethod === 'dinheiro' ||
                      paymentMethod === 'cartao' ||
                      paymentMethod === 'parcelado'
                    }
                    className={`w-full border rounded p-2 text-sm font-medium ${
                      paymentMethod === 'dinheiro' ||
                      paymentMethod === 'cartao' ||
                      paymentMethod === 'parcelado'
                        ? 'bg-green-50 text-green-700 border-green-200 cursor-not-allowed'
                        : paymentStatus === 'pago'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : paymentStatus === 'parcial'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {/* Dinheiro, Cartão e Parcelado: apenas "Completo" */}
                    {(paymentMethod === 'dinheiro' ||
                      paymentMethod === 'cartao' ||
                      paymentMethod === 'parcelado') && (
                      <option value="pago">✓ Completo (Pago)</option>
                    )}

                    {/* Boca e Aberto: apenas "Parcial" e "Pendente" */}
                    {(paymentMethod === 'boca' || paymentMethod === 'aberto') && (
                      <>
                        <option value="parcial">Parcial</option>
                        <option value="aberto">Pendente</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Detalhes Boca */}
            {paymentMethod === 'boca' && (
              <div className="bg-amber-50 p-3 rounded border border-amber-200 space-y-2 animate-in slide-in-from-top-2">
                <p className="text-xs font-bold text-amber-800 uppercase">Detalhes do Fiado</p>

                {/* Se for pagamento parcial, mostrar campo "Pago Agora" */}
                {paymentStatus === 'parcial' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-amber-700 font-medium block mb-1">
                        💰 Valor Pago Agora
                      </label>
                      <CurrencyInput
                        placeholder="Quanto o cliente pagou agora?"
                        value={bocaPaidNow}
                        onValueChange={(val) => {
                          setBocaPaidNow(val || '');
                          // Calcular automaticamente o valor pendente
                          const paidAmount = parseFloat(
                            (val || '0').replace(/\./g, '').replace(',', '.'),
                          );
                          const remaining = total - paidAmount;
                          setBocaValue(
                            remaining > 0 ? remaining.toFixed(2).replace('.', ',') : '0',
                          );
                        }}
                        prefix="R$ "
                        className="w-full border border-green-300 rounded p-2 text-sm bg-white"
                        intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                      />
                      <p className="text-xs text-amber-600 mt-1">
                        Este valor entrará no caixa como recebido
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-amber-700 font-medium block mb-1">
                        📋 Valor Pendente (Calculado)
                      </label>
                      <CurrencyInput
                        value={bocaValue}
                        onValueChange={(val) => setBocaValue(val || '')}
                        prefix="R$ "
                        className="w-full border rounded p-2 text-sm bg-amber-100"
                        intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                        disabled
                      />
                    </div>
                  </div>
                )}

                {/* Se for pendente total, mostrar apenas valor pendente */}
                {paymentStatus === 'aberto' && (
                  <CurrencyInput
                    placeholder="Valor Pendente"
                    value={bocaValue}
                    onValueChange={(val) => setBocaValue(val || '')}
                    prefix="R$ "
                    className="w-full border rounded p-2 text-sm"
                    intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                    disabled
                  />
                )}

                <input
                  type="text"
                  placeholder="Obs (Ex: Paga dia 15)"
                  value={bocaNotes}
                  onChange={(e) => setBocaNotes(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
                {selectedCustomer && (
                  <Link
                    href="/admin/clientes-pagar"
                    target="_blank"
                    className="text-xs text-amber-700 hover:underline flex items-center gap-1"
                  >
                    <Wallet className="h-3 w-3" />
                    Ver Histórico de Débitos
                  </Link>
                )}
              </div>
            )}

            {/* Detalhes Cartão */}
            {(paymentMethod === 'cartao' || paymentMethod === 'parcelado') && (
              <div className="bg-zinc-50 p-3 rounded border border-zinc-200 space-y-2 animate-in slide-in-from-top-2">
                <p className="text-xs font-bold text-zinc-500 uppercase">Detalhes da Maquininha</p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value)}
                    className="border rounded p-2 text-sm"
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">Master</option>
                    <option value="elo">Elo</option>
                    <option value="amex">Amex</option>
                    <option value="hiper">Hiper</option>
                  </select>
                  <CurrencyInput
                    placeholder="Taxa (R$)"
                    value={cardTax}
                    onValueChange={(val) => setCardTax(val || '')}
                    prefix="R$ "
                    className="w-full border rounded p-2 text-sm"
                    intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="ID Transação / NSU"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full border rounded p-2 text-sm font-mono uppercase"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500 mb-1 block">
                Observações da Venda
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="..."
              />
            </div>
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
