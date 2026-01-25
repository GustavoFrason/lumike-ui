'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ordersService, Order } from '@/lib/services/orders.service';
import { formatDate, formatCurrency } from '@/lib/formatters';

export default function ReceiptPage() {
    // Recebemos a Order completa para evitar novo fetch, mas como é nova pág, precisamos buscar.
    const params = useParams();
    const id = Number(params.id);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadOrder = useCallback(async () => {
        try {
            setLoading(true);
            const data = await ordersService.getById(id);
            setOrder(data);
            // Agenda impressão automática após renderizar
            setTimeout(() => {
                window.print();
            }, 1000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar pedido';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!id) return;
        loadOrder();
    }, [id, loadOrder]);

    if (loading) return <div className="text-center p-8">Carregando recibo...</div>;
    if (error || !order) return <div className="text-red-600 p-8">{error || 'Pedido não encontrado'}</div>;

    return (
        <div className="max-w-[80mm] mx-auto p-4 bg-white text-black font-mono text-sm leading-tight print:max-w-none print:w-full print:p-0">
            {/* Header */}
            <div className="text-center mb-4 border-b pb-4">
                <h1 className="text-xl font-bold mb-1">LUMIKE</h1>
                <p className="text-xs">Semijoias & Acessórios</p>
                <p className="text-xs">CNPJ: 00.000.000/0001-00</p>
                <p className="text-xs mb-2">Tel: (11) 99999-9999</p>

                <p className="font-bold">RECIBO #{order.id}</p>
                <p className="text-xs">{formatDate(order.created_at)}</p>
            </div>

            {/* Customer */}
            <div className="mb-4 border-b pb-4">
                <p><strong>Cliente:</strong> {order.customers?.name || 'Consumidor Final'}</p>
                {order.customers?.phone && <p>Tel: {order.customers.phone}</p>}
            </div>

            {/* Items */}
            <div className="mb-4 border-b pb-4">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="pb-2">Item</th>
                            <th className="pb-2 text-right">Val</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, index) => (
                            <tr key={index}>
                                <td className="py-1">
                                    <div className="font-bold">{item.products?.name}</div>
                                    <div className="text-xs text-zinc-500">
                                        {item.quantity}x {formatCurrency(item.unit_price)}
                                    </div>
                                </td>
                                <td className="text-right align-top">
                                    {formatCurrency(item.quantity * item.unit_price)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="mb-8 text-right">
                <p className="text-lg font-bold">TOTAL: {formatCurrency(order.total_amount)}</p>
                <p className="text-xs text-zinc-500 mt-1">Forma de Pagto: A Combinar</p>
            </div>

            {/* Footer */}
            <div className="text-center text-xs">
                <p>Obrigado pela preferência!</p>
                <p className="mt-1">Trocas somente com etiqueta e este cupom em até 7 dias.</p>
                <p className="mt-4">www.lumike.com.br</p>
            </div>

            {/* Print Button (Hide on Print) */}
            <button
                onClick={() => window.print()}
                className="mt-8 w-full bg-black text-white py-2 rounded print:hidden"
            >
                Imprimir
            </button>
        </div>
    );
}
