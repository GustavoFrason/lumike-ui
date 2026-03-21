'use client';

import { useState } from 'react';
import { CreateAccessoryPurchaseDto } from '@/lib/services/accessory-purchases.service';
import { ErrorMessage } from '@/components/ui/error-message';
import CurrencyInput from 'react-currency-input-field';

interface AccessoryPurchaseModalProps {
  onClose: () => void;
  onSave: (data: CreateAccessoryPurchaseDto) => Promise<void>;
}

export function AccessoryPurchaseModal({ onClose, onSave }: AccessoryPurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateAccessoryPurchaseDto>({
    type: 'Embalagem',
    quantity: 1,
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0],
    unit_price: 0,
    notes: '',
  });

  const [priceStr, setPriceStr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  function handlePriceChange(value: string | undefined) {
    setPriceStr(value || '');
    if (value) {
      const numeric = parseFloat(value.replace(/\./g, '').replace(',', '.'));
      setForm((prev) => ({ ...prev, unit_price: numeric }));
    } else {
      setForm((prev) => ({ ...prev, unit_price: 0 }));
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl animate-in fade-in zoom-in-95">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Nova Compra de Acessório/Item</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <ErrorMessage message={error || ''} />

          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Embalagem">Embalagem</option>
              <option value="Brinde">Brinde</option>
              <option value="Material Escritório">Material Escritório</option>
              <option value="Limpeza">Limpeza</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fornecedor</label>
            <input
              type="text"
              required
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Nome do fornecedor"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Qtd.</label>
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                required
                value={form.purchase_date}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor Unitário</label>
            <CurrencyInput
              placeholder="R$ 0,00"
              value={priceStr}
              onValueChange={handlePriceChange}
              prefix="R$ "
              decimalSeparator=","
              groupSeparator="."
              className="w-full border rounded px-3 py-2 font-mono"
              intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Detalhes opcionais..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border rounded hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--lumike-gold)] text-white rounded hover:opacity-90 font-medium"
            >
              {loading ? 'Salvando...' : 'Registrar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
