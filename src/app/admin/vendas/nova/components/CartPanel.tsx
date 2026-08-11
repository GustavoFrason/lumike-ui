import Image from 'next/image';
import { Trash, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { CartItem } from './types';

interface CartPanelProps {
  cart: CartItem[];
  total: number;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveFromCart: (productId: number) => void;
}

export function CartPanel({ cart, total, onUpdateQuantity, onRemoveFromCart }: CartPanelProps) {
  return (
    <>
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
                  <Image src={item.product.images[0].url} alt="" fill className="object-cover" />
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
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    className="px-1 text-zinc-400 hover:text-zinc-600"
                  >
                    -
                  </button>
                  <span className="text-xs w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="px-1 text-zinc-400 hover:text-zinc-600"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onRemoveFromCart(item.product.id)}
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
    </>
  );
}
