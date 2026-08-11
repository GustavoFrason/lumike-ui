'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { inventoryService, SellerInventory } from '@/lib/services/inventory.service';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { User as UserIcon, Package, ChevronLeft } from 'lucide-react';

export default function RevendedorasInventarioPage() {
  const [sellers, setSellers] = useState<SellerInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inventoryService
      .getAllSellersStock()
      .then(setSellers)
      .catch(() => setError('Erro ao carregar o inventário das revendedoras.'))
      .finally(() => setLoading(false));
  }, []);

  const totalGeral = sellers.reduce((sum, s) => sum + s.total_items, 0);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <Link
          href="/admin/estoque"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 mb-3"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Voltar pro Estoque
        </Link>
        <h1 className="text-2xl font-serif text-zinc-900 font-medium">Inventário por Revendedora</h1>
        <p className="text-zinc-500 mt-1">
          Tudo que está com cada revendedora agora — use pra conferência semanal ou mensal.
        </p>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : sellers.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 bg-white rounded-2xl border border-zinc-100">
          <Package className="h-8 w-8 mx-auto mb-3 opacity-40" />
          Nenhuma peça está com revendedoras no momento — tudo está no Estoque Lumike (central).
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              {sellers.length} revendedora{sellers.length > 1 ? 's' : ''} com peças em mãos
            </span>
            <span className="text-sm font-bold text-zinc-800">
              Total geral: <span className="text-(--lumike-gold)">{totalGeral} peças</span>
            </span>
          </div>

          {sellers.map((seller) => (
            <div key={seller.user_id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/70 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl shadow-xs flex items-center justify-center text-zinc-400">
                    <UserIcon className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-bold text-zinc-800">{seller.name}</span>
                </div>
                <span className="text-xs font-bold text-zinc-500">{seller.total_items} peças</span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-400 border-b border-zinc-50">
                    <th className="px-6 py-2 font-bold">Produto</th>
                    <th className="px-6 py-2 font-bold">SKU</th>
                    <th className="px-6 py-2 font-bold text-right">Preço</th>
                    <th className="px-6 py-2 font-bold text-right">Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  {seller.items.map((item) => (
                    <tr key={item.product_id} className="border-b border-zinc-50 last:border-0">
                      <td className="px-6 py-3 text-zinc-700">{item.name}</td>
                      <td className="px-6 py-3 text-zinc-400 font-mono text-xs">{item.sku}</td>
                      <td className="px-6 py-3 text-right text-zinc-500">
                        {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-zinc-800">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
