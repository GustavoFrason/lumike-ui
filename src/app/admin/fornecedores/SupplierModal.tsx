'use client';

import { useState } from 'react';
import { Supplier } from '@/lib/services/suppliers.service';

interface ModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (supplier: Partial<Supplier>) => void;
  loading?: boolean;
}

export function SupplierModal({ supplier, onClose, onSave, loading = false }: ModalProps) {
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contact_name: supplier?.contact_name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    document: supplier?.document || '',
    address: supplier?.address || '',
    category: supplier?.category || '',
    notes: supplier?.notes || '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-2xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Nome da Empresa / Fantasia *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Ex: Fornecedor de Semijoias LTDA"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumilee-gold) outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nome do Contato
              </label>
              <input
                type="text"
                name="contact_name"
                placeholder="Ex: João Silva"
                value={form.contact_name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumilee-gold) outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                placeholder="(11) 91234-5678"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumilee-gold) outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">E-mail</label>
              <input
                type="email"
                name="email"
                placeholder="fornecedor@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumilee-gold) outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">CNPJ / CPF</label>
              <input
                type="text"
                name="document"
                placeholder="00.000.000/0000-00"
                value={form.document}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumilee-gold) outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Categoria / Ramo</label>
            <input
              type="text"
              name="category"
              placeholder="Ex: Banho de Ouro, Pedrarias, Embalagens"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumilee-gold) outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Endereço</label>
            <input
              type="text"
              name="address"
              placeholder="Rua, número, complemento, cidade - UF"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumilee-gold) outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Observações</label>
            <textarea
              name="notes"
              placeholder="Detalhes adicionais, prazos de entrega, condições de pagamento..."
              value={form.notes}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumilee-gold) outline-none"
              rows={3}
            />
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
              className="flex-1 bg-(--lumilee-gold) text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
