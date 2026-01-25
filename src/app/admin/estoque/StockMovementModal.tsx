'use client';

import { useState } from 'react';
import { Product } from '@/lib/services/products.service';

interface ModalProps {
  produto: Product;
  type: 'entry' | 'exit';
  onClose: () => void;
  onSave: (quantity: number, reference?: string) => void;
  loading?: boolean;
}

export function StockMovementModal({
  produto,
  type,
  onClose,
  onSave,
  loading = false,
}: ModalProps) {
  const [quantity, setQuantity] = useState('');
  const [reference, setReference] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (qty <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    if (type === 'exit' && qty > produto.current_stock) {
      alert(`Estoque insuficiente. Disponível: ${produto.current_stock}`);
      return;
    }

    onSave(qty, reference || undefined);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-md p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-2">
          {type === 'entry' ? 'Entrada de Estoque' : 'Saída de Estoque'}
        </h2>
        <p className="text-sm text-zinc-600 mb-4">Produto: {produto.name}</p>
        {type === 'exit' && (
          <p className="text-sm text-zinc-500 mb-4">
            Estoque disponível: <strong>{produto.current_stock}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Quantidade *
            </label>
            <input
              type="number"
              min="1"
              max={type === 'exit' ? produto.current_stock : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
              placeholder="Digite a quantidade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Referência (opcional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Ex: compra:123, pedido:456"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Referência para rastreamento (ex: número de pedido, compra, etc.)
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-zinc-300 text-zinc-700 py-2 rounded-lg hover:bg-zinc-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 rounded-lg text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                type === 'entry'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Processando...' : type === 'entry' ? 'Registrar Entrada' : 'Registrar Saída'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

