'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Search, Plus, User, X } from 'lucide-react';
import { customersService, Customer, CreateCustomerDto } from '@/lib/services/customers.service';
import { ErrorMessage } from '@/components/ui/error-message';
import { getErrorMessage } from '@/lib/utils';

interface CustomerSearchProps {
  onSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

export function CustomerSearch({ onSelect, selectedCustomer }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Create Form State
  const [newCustomer, setNewCustomer] = useState<CreateCustomerDto>({
    name: '',
    phone: '',
    email: '',
    cpf: '',
  });
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Search Effect
  useEffect(() => {
    async function search() {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Assuming getAll supports search query
        const data = await customersService.getAll(1, 10, debouncedSearch);
        setResults(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (!selectedCustomer) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  async function handleCreate() {
    if (!newCustomer.name) return;

    setCreatingLoading(true);
    setCreateError('');
    try {
      // Clean up empty strings to undefined for optional fields
      const payload: CreateCustomerDto = {
        name: newCustomer.name,
        email: newCustomer.email?.trim() || undefined,
        phone: newCustomer.phone?.trim() || undefined,
        cpf: newCustomer.cpf?.trim() || undefined,
      };

      const created = await customersService.create(payload);
      onSelect(created);
      setIsCreating(false);
      setNewCustomer({ name: '', phone: '', email: '', cpf: '' });
      setSearchTerm('');
    } catch (err) {
      setCreateError(getErrorMessage(err, 'Erro ao criar cliente'));
    } finally {
      setCreatingLoading(false);
    }
  }

  if (selectedCustomer) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <User className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <p className="font-semibold text-green-900">{selectedCustomer.name}</p>
            <div className="flex gap-2 text-xs text-green-700">
              <span>{selectedCustomer.cpf || 'Sem CPF'}</span>
              <span>•</span>
              <span>{selectedCustomer.phone || 'Sem Telefone'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onSelect(null)}
          className="p-1 hover:bg-green-100 rounded text-green-700 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isCreating ? (
        <div className="relative">
          <label className="block text-sm font-medium text-zinc-700 mb-1">Cliente</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              id="customer-search-input"
              type="text"
              placeholder="Buscar cliente (Nome, CPF, Tel)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-(--lumilee-gold) focus:outline-none"
            />
            <button
              onClick={() => setIsCreating(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-600"
              title="Novo Cliente"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Results Dropdown */}
          {results.length > 0 && !selectedCustomer && (
            <div className="absolute top-full left-0 right-0 py-2 bg-white rounded-lg shadow-lg border border-zinc-100 z-10 max-h-60 overflow-y-auto mt-1">
              {loading && <div className="p-2 text-center text-xs text-zinc-400">Buscando...</div>}
              {results.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    onSelect(customer);
                    setSearchTerm('');
                    setResults([]);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex flex-col"
                >
                  <span className="font-medium text-sm text-zinc-800">{customer.name}</span>
                  <span className="text-xs text-zinc-500">
                    {customer.cpf} {customer.phone ? `• ${customer.phone}` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">Novo Cliente</h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {createError && <ErrorMessage message={createError} />}
          <input
            type="text"
            placeholder="Nome Completo *"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Telefone"
              value={newCustomer.phone || ''}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <input
              type="text"
              placeholder="CPF"
              value={newCustomer.cpf || ''}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, cpf: e.target.value }))}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creatingLoading || !newCustomer.name}
            className="w-full py-2 bg-(--lumilee-gold) text-white rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {creatingLoading ? 'Salvando...' : 'Cadastrar Cliente'}
          </button>
        </div>
      )}
    </div>
  );
}
