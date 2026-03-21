'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import {
  Shield,
  User,
  Package,
  Calendar,
  MessageSquare,
  Save,
  Trash2,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { warrantiesService, Warranty, WarrantyStatus } from '@/lib/services/warranties.service';
import { formatCurrency } from '@/lib/formatters';

const statusMap: Record<WarrantyStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800' },
  analyzing: { label: 'Em Análise', color: 'bg-blue-100 text-blue-800' },
  factory: { label: 'Na Fábrica', color: 'bg-purple-100 text-purple-800' },
  ready: { label: 'Pronta', color: 'bg-green-100 text-green-800' },
  finished: { label: 'Finalizada', color: 'bg-zinc-100 text-zinc-800' },
  rejected: { label: 'Recusada', color: 'bg-red-100 text-red-800' },
};

export default function WarrantyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<WarrantyStatus>('pending');

  useEffect(() => {
    const loadWarranty = async () => {
      try {
        const data = await warrantiesService.findOne(id);
        setWarranty(data);
        setNotes(data.internal_notes || '');
        setStatus(data.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadWarranty();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await warrantiesService.update(id, {
        status,
        internal_notes: notes,
      });
      router.refresh();
      alert('Alterações salvas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este registro de garantia?')) return;
    try {
      await warrantiesService.remove(id);
      router.push('/admin/garantias');
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir');
    }
  };

  if (loading) return <Loading size="lg" text="Carregando detalhes do chamado..." />;
  if (!warranty) return <div className="p-8 text-center">Garantia não encontrada.</div>;

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Garantias', href: '/admin/garantias' },
          { label: `Chamado #${id.substring(0, 8)}` },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold font-serif text-zinc-900">Detalhes da Garantia</h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary-gold text-white">
            {saving ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Timing */}
          <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Status Atual
              </p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WarrantyStatus)}
                className={`text-sm font-bold px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-primary-gold w-full ${statusMap[status].color}`}
              >
                {Object.entries(statusMap).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Data Abertura
              </p>
              <p className="text-sm font-medium text-zinc-900">
                {new Date(warranty.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Tipo Defeito
              </p>
              <p className="text-sm font-medium text-zinc-900 capitalize">{warranty.type}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Data Conclusão
              </p>
              <p className="text-sm font-medium text-zinc-900">
                {warranty.finished_at ? new Date(warranty.finished_at).toLocaleDateString() : '---'}
              </p>
            </div>
          </div>

          {/* Description & Notes */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary-gold" />
                Relato do Problema
              </h3>
              <div className="p-4 bg-zinc-50 rounded-lg border text-zinc-700 italic">
                &quot;{warranty.description || 'Nenhuma descrição fornecida.'}&quot;
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary-gold" />
                Notas Internas (Acompanhamento)
              </h3>
              <textarea
                className="w-full min-h-[150px] p-4 border rounded-lg focus:ring-2 focus:ring-primary-gold text-sm"
                placeholder="Ex: Peça enviada para fábrica X no dia 05/02..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </h3>
            <div>
              <p className="font-bold text-zinc-900">{warranty.customers?.name}</p>
              <p className="text-sm text-zinc-500">{warranty.customers?.email}</p>
              <p className="text-sm text-zinc-500">{warranty.customers?.whatsapp}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                window.open(
                  `https://wa.me/${warranty.customers?.whatsapp?.replace(/\D/g, '')}`,
                  '_blank',
                )
              }
            >
              Chamar no WhatsApp
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>

          {/* Product Card */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produto
            </h3>
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-zinc-100 rounded border shrink-0 overflow-hidden">
                {/* Fallback to SKU text if no initial image */}
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-400 uppercase">
                  Foto
                </div>
              </div>
              <div>
                <p className="font-bold text-zinc-900 text-sm">{warranty.products?.name}</p>
                <p className="text-xs text-zinc-500">SKU: {warranty.products?.sku}</p>
              </div>
            </div>
          </div>

          {/* Order Info */}
          {warranty.orders && (
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Venda de Origem
              </h3>
              <p className="text-sm font-medium">Pedido #{warranty.order_id}</p>
              <p className="text-xs text-zinc-500">
                Data: {new Date(warranty.orders.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs font-bold text-primary-gold">
                Valor: {formatCurrency(warranty.orders.total_amount)}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
