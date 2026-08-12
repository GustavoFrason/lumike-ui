'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/services/products.service';
import { usersService, User } from '@/lib/services/users.service';
import { ClipboardCheck, Home, User as UserIcon } from 'lucide-react';
import { ProductStock } from '@/lib/services/inventory.service';

interface StockAdjustmentModalProps {
  produto: Product;
  stockInfo?: ProductStock | null;
  onClose: () => void;
  onSave: (data: { user_id: number | null; counted_quantity: number; reason: string }) => void;
  loading?: boolean;
}

export function StockAdjustmentModal({
  produto,
  stockInfo,
  onClose,
  onSave,
  loading = false,
}: StockAdjustmentModalProps) {
  const [sellers, setSellers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | null>(null); // null = Central
  const [countedQuantity, setCountedQuantity] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    usersService.getSellers().then(setSellers);
  }, []);

  const expectedQuantity =
    userId === null
      ? stockInfo?.central || 0
      : stockInfo?.sellers.find((s) => s.user_id === userId)?.quantity || 0;

  const counted = Number(countedQuantity);
  const delta = countedQuantity !== '' ? counted - expectedQuantity : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (countedQuantity === '' || counted < 0) {
      alert('Informe a quantidade contada (não pode ser negativa)');
      return;
    }

    if (!reason.trim()) {
      alert('Descreva o motivo/observação da conferência');
      return;
    }

    onSave({ user_id: userId, counted_quantity: counted, reason: reason.trim() });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-zinc-50 bg-linear-to-r from-zinc-50/50 to-white">
          <div className="flex items-center gap-3 mb-1">
            <ClipboardCheck className="h-5 w-5 text-(--lumilee-gold)" />
            <h2 className="text-2xl font-serif text-zinc-900 font-medium">
              Conferência de Estoque
            </h2>
          </div>
          <p className="text-zinc-500 text-sm">
            Produto: <span className="font-bold text-zinc-800">{produto.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Localidade conferida
            </label>
            <div className="relative">
              <select
                value={userId === null ? 'central' : userId}
                onChange={(e) =>
                  setUserId(e.target.value === 'central' ? null : Number(e.target.value))
                }
                className="w-full bg-zinc-50 border-zinc-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all appearance-none"
              >
                <option value="central">Estoque Lumilee</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                {userId === null ? (
                  <Home className="h-4 w-4 text-zinc-400" />
                ) : (
                  <UserIcon className="h-4 w-4 text-zinc-400" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                Sistema aponta
              </label>
              <div className="w-full bg-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-600 text-center">
                {expectedQuantity} un
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                Contado agora
              </label>
              <input
                type="number"
                min="0"
                value={countedQuantity}
                onChange={(e) => setCountedQuantity(e.target.value)}
                className="w-full bg-zinc-50 border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-900 text-center focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all"
                required
                placeholder="0"
              />
            </div>
          </div>

          {delta !== null && (
            <div
              className={`text-center text-sm font-bold rounded-2xl py-3 ${
                delta === 0
                  ? 'bg-green-50 text-green-700'
                  : delta > 0
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-red-50 text-red-700'
              }`}
            >
              {delta === 0
                ? 'Sem diferença — nada será ajustado'
                : delta > 0
                  ? `Sobrou ${delta} a mais do que o sistema apontava`
                  : `Faltam ${Math.abs(delta)} em relação ao sistema`}
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
              Motivo / observação
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-zinc-50 border-zinc-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-(--lumilee-gold) outline-none transition-all"
              placeholder="Ex: Conferência mensal de agosto"
              required
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-zinc-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:text-zinc-700 transition-colors border border-zinc-200 rounded-2xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || countedQuantity === ''}
              className="flex-1 py-4 bg-(--lumilee-gold) text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-orange-100 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Registrando...' : 'Confirmar Conferência'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
