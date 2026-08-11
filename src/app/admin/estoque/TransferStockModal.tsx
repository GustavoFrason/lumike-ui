'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/services/products.service';
import { usersService, User } from '@/lib/services/users.service';
import { Package, ArrowRight, Home, User as UserIcon } from 'lucide-react';
import { ProductStock } from '@/lib/services/inventory.service';

interface TransferModalProps {
  produto: Partial<Product>;
  stockInfo?: ProductStock | null;
  onClose: () => void;
  onSave: (data: { from_user_id: number | null; to_user_id: number | null; quantity: number; notes?: string }) => void;
  loading?: boolean;
}

export function TransferStockModal({
  produto,
  stockInfo,
  onClose,
  onSave,
  loading = false,
}: TransferModalProps) {
  const [sellers, setSellers] = useState<User[]>([]);
  const [fromUserId, setFromUserId] = useState<number | null>(null); // null = Central
  const [toUserId, setToUserId] = useState<number | null>(null);   // null = Central
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    usersService.getSellers().then(setSellers);
  }, []);

  const currentFromStock = fromUserId === null 
    ? stockInfo?.central || 0 
    : stockInfo?.sellers.find(s => s.user_id === fromUserId)?.quantity || 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(quantity);
    
    if (qty <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    if (fromUserId === toUserId) {
      alert('Origem e destino devem ser diferentes');
      return;
    }

    if (qty > currentFromStock) {
      alert(`Estoque insuficiente na origem. Disponível: ${currentFromStock}`);
      return;
    }

    onSave({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      quantity: qty,
      notes: notes || undefined
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-zinc-50 bg-linear-to-r from-zinc-50/50 to-white">
          <div className="flex items-center gap-3 mb-1">
            <Package className="h-5 w-5 text-(--lumike-gold)" />
            <h2 className="text-2xl font-serif text-zinc-900 font-medium">Transferir Estoque</h2>
          </div>
          <p className="text-zinc-500 text-sm">Produto: <span className="font-bold text-zinc-800">{produto.name}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Origem */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Origem</label>
              <div className="relative">
                <select
                  value={fromUserId === null ? 'central' : fromUserId}
                  onChange={(e) => setFromUserId(e.target.value === 'central' ? null : Number(e.target.value))}
                  className="w-full bg-zinc-50 border-zinc-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-(--lumike-gold) outline-none transition-all appearance-none"
                >
                  <option value="central">Estoque Lumike</option>
                  {sellers.map(seller => (
                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  {fromUserId === null ? <Home className="h-4 w-4 text-zinc-400" /> : <UserIcon className="h-4 w-4 text-zinc-400" />}
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 px-1">Disponível: <span className="font-bold text-(--lumike-gold)">{currentFromStock} un</span></p>
            </div>

            <div className="flex justify-center pt-6 md:pt-4">
              <ArrowRight className="h-5 w-5 text-zinc-300" />
            </div>

            {/* Destino */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Destino</label>
              <div className="relative">
                <select
                  value={toUserId === null ? 'central' : toUserId}
                  onChange={(e) => setToUserId(e.target.value === 'central' ? null : Number(e.target.value))}
                  className="w-full bg-zinc-50 border-zinc-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-(--lumike-gold) outline-none transition-all appearance-none"
                >
                  <option value="central">Estoque Lumike</option>
                  {sellers.map(seller => (
                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  {toUserId === null ? <Home className="h-4 w-4 text-zinc-400" /> : <UserIcon className="h-4 w-4 text-zinc-400" />}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Quantidade</label>
              <input
                type="number"
                min="1"
                max={currentFromStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-zinc-50 border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-(--lumike-gold) outline-none transition-all"
                required
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Observações (opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-50 border-zinc-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-(--lumike-gold) outline-none transition-all"
                placeholder="Ex: Entrega semanal"
              />
            </div>
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
              disabled={loading || !quantity || Number(quantity) <= 0 || fromUserId === toUserId}
              className="flex-1 py-4 bg-(--lumike-gold) text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-orange-100 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Processando...' : 'Confirmar Transferência'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
