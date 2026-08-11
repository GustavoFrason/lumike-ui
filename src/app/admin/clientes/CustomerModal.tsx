'use client';

import { useState } from 'react';
import { Customer } from '@/lib/hooks/use-customers';

import { UpdateCustomerDto } from '@/lib/services/customers.service';

interface ModalProps {
  cliente: Customer | null;
  onClose: () => void;
  onSave: (cliente: UpdateCustomerDto) => void;
  loading?: boolean;
}

export function CustomerModal({ cliente, onClose, onSave, loading = false }: ModalProps) {
  const [form, setForm] = useState({
    name: cliente?.name || '',
    email: cliente?.email || '',
    phone: cliente?.phone || '',
    cpf: cliente?.cpf || '',
    address: cliente?.address || '',
    city: cliente?.city || '',
    state: cliente?.state || '',
    zipcode: cliente?.zipcode || '',
    notes: cliente?.notes || '',
  });

  const [searchingCep, setSearchingCep] = useState(false);

  function maskCpf(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }

  function maskPhone(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }

  function maskCep(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  }

  async function handleCepBlur(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      setSearchingCep(true);
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setSearchingCep(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'cpf') maskedValue = maskCpf(value);
    if (name === 'phone') maskedValue = maskPhone(value);
    if (name === 'zipcode') maskedValue = maskCep(value);

    setForm((prev) => ({ ...prev, [name]: maskedValue }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const clienteData: UpdateCustomerDto = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      cpf: form.cpf || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      zipcode: form.zipcode || undefined,
      notes: form.notes || undefined,
    };

    onSave(clienteData);
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
          {cliente ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nome *</label>
            <input
              type="text"
              name="name"
              placeholder="Nome completo"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">E-mail</label>
              <input
                type="email"
                name="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Telefone</label>
              <input
                type="text"
                name="phone"
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumike-gold) outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">CPF</label>
            <input
              type="text"
              name="cpf"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumike-gold) outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Endereço</label>
            <input
              type="text"
              name="address"
              placeholder="Rua, número, complemento"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Cidade</label>
              <input
                type="text"
                name="city"
                placeholder="Cidade"
                value={form.city}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Estado</label>
              <input
                type="text"
                name="state"
                placeholder="SP"
                value={form.state}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 mb-1 flex justify-between">
                CEP 
                {searchingCep && <span className="text-[10px] text-(--lumike-gold) animate-pulse uppercase">Buscando...</span>}
              </label>
              <input
                type="text"
                name="zipcode"
                placeholder="00000-000"
                value={form.zipcode}
                onChange={handleChange}
                onBlur={(e) => handleCepBlur(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-(--lumike-gold) outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Observações</label>
            <textarea
              name="notes"
              placeholder="Observações sobre o cliente"
              value={form.notes}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
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
              disabled={loading || searchingCep}
              className="flex-1 bg-(--lumike-gold) text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
