'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductCard } from '@/components/catalog/product-card';
import { Product } from '@/lib/services/products.service';
import { Loader2, Bell, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StockAlertsPage() {
  const [outOfStockFavorites, setOutOfStockFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockAlerts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${backendUrl}/stock-notifications/my-alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Mapeia os dados para extrair os produtos e filtra nulos
        const alerts = response.data.map((alert: any) => alert.product).filter(Boolean);
        setOutOfStockFavorites(alerts);
      } catch (error) {
        console.error('Erro ao buscar alertas de estoque:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-gold" />
      </div>
    );
  }

  if (outOfStockFavorites.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-light-gray">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-playfair font-bold text-deep-black mb-2">
          Sem alertas de estoque
        </h2>
        <p className="text-medium-gray mb-6">
          Todos os seus favoritos estão disponíveis ou você ainda não favoritou itens esgotados.
        </p>
        <Link
          href="/minha-conta/favoritos"
          className="inline-flex items-center gap-2 text-primary-gold font-bold uppercase text-xs tracking-widest hover:underline"
        >
          Ver Meus Favoritos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold">Avisos de Estoque</h1>
          <p className="text-medium-gray mt-2">Personalize seus alertas para itens que você ama.</p>
        </div>
        <div className="bg-primary-gold/10 px-4 py-2 rounded-full hidden md:block">
          <p className="text-xs text-primary-gold font-bold uppercase tracking-widest">
            {outOfStockFavorites.length}{' '}
            {outOfStockFavorites.length === 1 ? 'Item monitorado' : 'Itens monitorados'}
          </p>
        </div>
      </div>

      <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-sm mb-8">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-zinc-200 flex-shrink-0">
            <Bell className="w-5 h-5 text-primary-gold" />
          </div>
          <div>
            <p className="text-sm font-bold text-deep-black uppercase tracking-wider">
              Como funciona?
            </p>
            <p className="text-sm text-medium-gray mt-1 leading-relaxed">
              Nós monitoramos seus favoritos acima. Assim que qualquer um desses itens retornar ao
              nosso estoque, você verá um aviso destacado aqui e em sua página inicial.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {outOfStockFavorites.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
