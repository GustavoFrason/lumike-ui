'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ordersService, Order } from '@/lib/services/orders.service';
import { formatDate } from '@/lib/formatters';

export default function WarrantyPage() {
    const params = useParams();
    const id = Number(params.id);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        ordersService.getById(id).then(setOrder).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    if (loading || !order) return <div className="text-center p-8">Carregando...</div>;

    const expirationDate = new Date(order.created_at);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    return (
        <div className="max-w-[148mm] mx-auto p-8 bg-white text-black font-serif border-4 border-double border-[var(--lumike-gold)] print:max-w-none print:w-full print:border-4">

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-widest text-[var(--lumike-taupe-dark)] mb-2">LUMIKE</h1>
                <p className="text-xs tracking-[0.3em] uppercase mb-6">Semijoias & Acessórios</p>
                <h2 className="text-2xl border-t border-b border-[var(--lumike-gold)] py-2 inline-block px-8">CERTIFICADO DE GARANTIA</h2>
            </div>

            {/* Content */}
            <div className="space-y-6 text-center">
                <p className="text-lg">
                    Certificamos que as peças adquiridas no pedido <strong>#{order.id}</strong> possuem garantia de <strong>1 (um) ano</strong> contra defeitos de fabricação e banho.
                </p>

                <div className="bg-[var(--lumike-bg)] p-4 rounded text-left mx-auto max-w-md border border-[var(--lumike-taupe)]/20">
                    <p className="font-bold mb-2 text-center text-[var(--lumike-taupe)]">DETALHES DA COMPRA</p>
                    <div className="text-sm space-y-1">
                        <p><strong>Cliente:</strong> {order.customers?.name || 'Consumidor Final'}</p>
                        <p><strong>Data da Compra:</strong> {formatDate(order.created_at)}</p>
                        <p><strong>Válido até:</strong> {formatDate(expirationDate.toISOString())}</p>
                        <div className="pt-2 mt-2 border-t border-dashed border-[var(--lumike-taupe)]/30">
                            <p className="font-bold text-xs text-center mb-1">ITENS COBERTOS</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                                {order.items?.map((item, i) => (
                                    <li key={i}>{item.products?.name} <span className="text-xs text-zinc-500">({item.quantity}un)</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-zinc-600 max-w-lg mx-auto space-y-2 mt-8 text-justify">
                    <p className="font-bold text-center text-[var(--lumike-taupe)] mb-2">TERMOS DE USO</p>
                    <p>1. Esta garantia cobre exclusivamente o desprendimento total ou parcial do banho e fechos.</p>
                    <p>2. Não estão cobertos danos causados por mau uso, como: arranhões, quebras, contato com produtos químicos (perfumes, cremes, limpeza), água do mar ou piscina.</p>
                    <p>3. Indispensável a apresentação deste certificado para trocas ou reparos.</p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center space-y-4">
                <div className="w-48 border-b border-black mx-auto mb-2"></div>
                <p className="text-xs uppercase tracking-widest">Assinatura Lumike</p>

                <p className="text-[10px] text-zinc-400 mt-8">
                    Emitido em {new Date().toLocaleDateString()} via Lumike System
                </p>
            </div>

            <button
                onClick={() => window.print()}
                className="mt-8 w-full bg-[var(--lumike-taupe)] text-white py-3 rounded print:hidden hover:opacity-90 transition"
            >
                Imprimir Certificado
            </button>
        </div>
    );
}
