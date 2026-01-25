'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useOrders } from '@/lib/hooks/use-orders';
import { customersService } from '@/lib/services/customers.service';
import { formatCurrency } from '@/lib/formatters';
import { MessageCircle, Mail, Phone, ShoppingBag, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/lib/hooks/use-orders';
import { Customer } from '@/lib/services/customers.service';
import { useCallback } from 'react';

export default function CustomerDetailsPage() {
    const params = useParams();
    const id = Number(params.id);

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loadingCustomer, setLoadingCustomer] = useState(true);

    const { loadOrders, loadingOrders, orders } = useOrders();

    const loadData = useCallback(async () => {
        try {
            setLoadingCustomer(true);
            const data = await customersService.getById(id);
            setCustomer(data);

            // Load orders for this customer
            await loadOrders(1, 100, undefined, id);
        } catch (error) {
            console.error('Erro ao carregar cliente:', error);
        } finally {
            setLoadingCustomer(false);
        }
    }, [id, loadOrders]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id, loadData]);

    if (loadingCustomer) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--lumike-gold)]" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-medium text-zinc-900">Cliente não encontrado</h2>
                <Link href="/admin/clientes" className="text-[var(--lumike-gold)] hover:underline mt-2 inline-block">
                    Voltar para lista
                </Link>
            </div>
        );
    }

    // Calculate KPIs
    const totalSpent = orders.reduce((acc: number, order: Order) => acc + (Number(order.total_amount) || 0), 0);
    const averageTicket = orders.length > 0 ? totalSpent / orders.length : 0;
    const lastOrderDate = orders.length > 0 ? new Date(orders[0].created_at).toLocaleDateString() : '-';

    return (
        <section className="space-y-6">
            <div className="mb-6">
                <Link href="/admin/clientes" className="text-sm text-zinc-500 hover:text-zinc-800 flex items-center gap-1 mb-2">
                    <ArrowLeft className="h-4 w-4" /> Voltar para Clientes
                </Link>
                <Breadcrumb
                    items={[
                        { label: 'Admin', href: '/admin' },
                        { label: 'Clientes', href: '/admin/clientes' },
                        { label: customer.name },
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 bg-[var(--lumike-taupe)]/10 rounded-full flex items-center justify-center text-2xl font-serif text-[var(--lumike-taupe-dark)]">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-serif text-zinc-900">{customer.name}</h1>
                            <span className="text-xs text-zinc-500">Cadastrado em {new Date(customer.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {customer.email && (
                            <div className="flex items-center gap-3 text-sm text-zinc-600">
                                <Mail className="h-4 w-4 text-[var(--lumike-gold)]" />
                                <span>{customer.email}</span>
                            </div>
                        )}
                        {customer.phone && (
                            <div className="flex items-center gap-3 text-sm text-zinc-600">
                                <Phone className="h-4 w-4 text-[var(--lumike-gold)]" />
                                <span>{customer.phone}</span>
                            </div>
                        )}
                        {customer.phone && (
                            <a
                                href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition text-sm font-medium mt-4"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Conversar no WhatsApp
                            </a>
                        )}

                        <Link
                            href={`/admin/clientes/${id}/extrato`}
                            className="flex items-center justify-center gap-2 w-full bg-[var(--lumike-gold)] hover:bg-yellow-600 text-white py-2 rounded-lg transition text-sm font-medium mt-2"
                        >
                            <Calendar className="h-4 w-4" />
                            Ver Extrato Financeiro
                        </Link>
                    </div>
                </div>

                {/* Stats & History */}
                <div className="md:col-span-2 space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                <ShoppingBag className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Total Gasto (LTV)</span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--lumike-taupe-dark)] font-serif">
                                {formatCurrency(totalSpent)}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Última Compra</span>
                            </div>
                            <p className="text-xl font-semibold text-zinc-700">
                                {lastOrderDate}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                <div className="text-xs font-medium uppercase tracking-wider">Ticket Médio</div>
                            </div>
                            <p className="text-xl font-semibold text-zinc-700">
                                {formatCurrency(averageTicket)}
                            </p>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b bg-zinc-50 flex justify-between items-center">
                            <h2 className="font-semibold text-zinc-800">Histórico de Pedidos</h2>
                            <span className="text-xs bg-zinc-200 px-2 py-1 rounded-full text-zinc-600">
                                {orders.length} pedidos
                            </span>
                        </div>

                        {loadingOrders ? (
                            <div className="p-8 text-center text-zinc-500">Carregando pedidos...</div>
                        ) : orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-50 text-zinc-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Data</th>
                                            <th className="px-4 py-3">Total</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orders.map((order: Order) => (
                                            <tr key={order.id} className="hover:bg-zinc-50">
                                                <td className="px-4 py-3 text-zinc-600">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                    <div className="text-xs text-zinc-400">#{order.id}</div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-zinc-900">
                                                    {formatCurrency(order.total_amount)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-zinc-100 text-zinc-600'}
                          `}>
                                                        {order.status === 'completed' ? 'Concluído' :
                                                            order.status === 'pending' ? 'Pendente' :
                                                                order.status === 'paid' ? 'Pago' : order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={`/admin/vendas?highlight=${order.id}`} // Or maybe a direct order detail modal? For now, list.
                                                        className="text-[var(--lumike-gold)] hover:underline text-xs"
                                                    >
                                                        Ver Detalhes
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-zinc-400 italic">
                                Nenhum pedido encontrado para este cliente.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
