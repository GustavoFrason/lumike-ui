'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';

export type CashFlowType = 'IN' | 'OUT';
export type CashFlowCategory = 'venda' | 'estorno' | 'compra' | 'ajuste' | 'outros';

export interface CreateCashFlowEntry {
  type: CashFlowType;
  category: CashFlowCategory;
  amount: number;
  description: string;
}

interface ModalProps {
  onClose: () => void;
  onSave: (data: CreateCashFlowEntry) => Promise<void>;
}

export function TransactionModal({ onClose, onSave }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'OUT' as CashFlowType,
    category: 'compra' as CashFlowCategory,
    amount: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...form,
        amount: Number(form.amount),
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', getErrorMessage(error));
      // Optionally show error toast here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Nova Movimentação</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: 'IN' }))}
                className={`py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2
                                    ${
                                      form.type === 'IN'
                                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-1'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
              >
                Entrada (Receita)
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: 'OUT' }))}
                className={`py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2
                                    ${
                                      form.type === 'OUT'
                                        ? 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
              >
                Saída (Despesa)
              </button>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--lumilee-gold)] focus:border-transparent outline-none"
              >
                <option value="venda">Venda</option>
                <option value="compra">Compra (Despesa)</option>
                <option value="estorno">Estorno</option>
                <option value="ajuste">Ajuste Manual</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full border rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-[var(--lumilee-gold)] focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                name="description"
                required
                placeholder="Ex: Pagamento de Fornecedor, Retirada..."
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--lumilee-gold)] focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Data (Opcional, could default to now but editing might be useful) 
                            Skipping for now to keep it simple, it defaults to NOW() in backend or we could send it.
                            Wait, backend has created_at default now.
                            Let's keep it simple.
                         */}

            <Button
              type="submit"
              disabled={loading || !form.amount}
              className="w-full bg-[var(--lumilee-gold)] hover:bg-yellow-600 text-white font-medium py-2 rounded-lg mt-2"
            >
              {loading ? 'Salvando...' : 'Confirmar Lançamento'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
