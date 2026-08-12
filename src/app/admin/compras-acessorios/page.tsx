'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  accessoryPurchasesService,
  AccessoryPurchase,
  CreateAccessoryPurchaseDto,
} from '@/lib/services/accessory-purchases.service';
import { Loading } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Plus, Trash, Filter } from 'lucide-react';
import { AccessoryPurchaseModal } from './AccessoryPurchaseModal';

export default function AccessoryPurchasesPage() {
  const [items, setItems] = useState<AccessoryPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accessoryPurchasesService.getAll(1, 100, filterType || undefined);
      setItems(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleSave(data: CreateAccessoryPurchaseDto) {
    await accessoryPurchasesService.create(data);
    await loadItems();
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      await accessoryPurchasesService.remove(id);
      setItems(items.filter((i) => i.id !== id));
    } catch {
      alert('Erro ao excluir');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-playfair">Compras de Acessórios/Insumos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--lumilee-gold)] text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nova Compra
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded border w-fit">
        <Filter className="h-4 w-4 text-zinc-400" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border-none focus:ring-0 text-sm outline-none"
        >
          <option value="">Todos os Tipos</option>
          <option value="Embalagem">Embalagem</option>
          <option value="Brinde">Brinde</option>
          <option value="Material Escritório">Material Escritório</option>
          <option value="Limpeza">Limpeza</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-zinc-600">Data</th>
                <th className="p-4 font-semibold text-zinc-600">Tipo</th>
                <th className="p-4 font-semibold text-zinc-600">Fornecedor</th>
                <th className="p-4 font-semibold text-zinc-600">Qtd.</th>
                <th className="p-4 font-semibold text-zinc-600">Unitário</th>
                <th className="p-4 font-semibold text-zinc-600">Total</th>
                <th className="p-4 font-semibold text-zinc-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="p-4">{formatDate(item.purchase_date)}</td>
                  <td className="p-4">
                    <span className="bg-zinc-100 px-2 py-1 rounded text-xs font-medium">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4">{item.supplier}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4">{formatCurrency(item.unit_price)}</td>
                  <td className="p-4 font-medium">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AccessoryPurchaseModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
