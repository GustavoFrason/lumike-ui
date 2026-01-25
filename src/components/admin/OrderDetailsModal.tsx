'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/services/orders.service';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { StatusBadge } from '@/components/ui/status-badge';
import { X, User, MapPin, Package, Calendar, CreditCard, History } from 'lucide-react';
import { accountsReceivableService } from '@/lib/services/accounts-receivable.service';

interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
    const [payments, setPayments] = useState<any[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [refundAmount, setRefundAmount] = useState(0);
    const [cancelNotes, setCancelNotes] = useState('');
    const [submittingCancel, setSubmittingCancel] = useState(false);

    useEffect(() => {
        if (order.id) {
            setLoadingPayments(true);
            accountsReceivableService.getOrderPayments(order.id)
                .then(setPayments)
                .catch(err => console.error('Erro ao carregar pagamentos:', err))
                .finally(() => setLoadingPayments(false));
        }
    }, [order.id]);

    const statusLabels: Record<string, string> = {
        pending: 'Análise/Pendente',
        paid: 'Pago',
        completed: 'Concluído',
        cancelled: 'Cancelado',
        parcelado_boca: 'Parcelado Boca',
    };

    const paymentStatusLabels: Record<string, string> = {
        pago: 'Totalmente Pago',
        parcial: 'Pagamento Parcial',
        aberto: 'Pendente',
    };

    const paymentMethodLabels: Record<string, string> = {
        dinheiro: '💵 Dinheiro',
        cartao: '💳 Cartão',
        parcelado: '📅 Parcelado',
        boca: '👄 Boca (Fiado)',
        aberto: '⚪ Em Aberto',
        estorno: '↩️ Estorno/Devolução',
    };

    const statusColors: Record<string, 'pending' | 'active' | 'completed' | 'cancelled'> = {
        pending: 'pending',
        paid: 'completed',
        completed: 'completed',
        cancelled: 'cancelled',
        parcelado_boca: 'active',
    };

    const totalRecebido = order.total_amount - (order.boca_value ?? order.total_amount);

    async function handleCancelOrder() {
        if (!confirm('Tem certeza que deseja cancelar esta venda? Esta ação é irreversível.')) return;
        setSubmittingCancel(true);
        try {
            await fetch(`/api/orders/${order.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    refundAmount,
                    notes: cancelNotes
                })
            });
            alert('Venda cancelada com sucesso!');
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Erro ao cancelar venda.');
        } finally {
            setSubmittingCancel(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-[var(--lumike-beige)]">
                    <div>
                        <h2 className="text-2xl font-playfair font-bold text-zinc-900">
                            Pedido #{order.id}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <StatusBadge
                                status={statusColors[order.status] || 'pending'}
                                label={statusLabels[order.status] || order.status}
                            />
                            <span className="text-sm text-zinc-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {formatDate(order.created_at)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 transition hover:bg-white rounded-full"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-[var(--lumike-gold)]" /> Dados do Cliente
                            </h3>
                            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                <p className="font-medium text-zinc-900">{order.customers?.name}</p>
                                <p className="text-sm text-zinc-600">{order.customers?.email}</p>
                                <p className="text-sm text-zinc-600 font-mono mt-1">{order.customers?.phone}</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-[var(--lumike-gold)]" /> Pagamento
                            </h3>
                            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Método:</span>
                                    <span className="font-medium">{paymentMethodLabels[order.payment_method || ''] || order.payment_method}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Status:</span>
                                    <span className={`font-medium ${order.payment_status === 'pago' ? 'text-green-600' : 'text-amber-600'}`}>
                                        {paymentStatusLabels[order.payment_status || ''] || order.payment_status}
                                    </span>
                                </div>
                                {order.payment_status !== 'pago' ? (
                                    <div className="space-y-2 pt-2 border-t border-zinc-200">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Valor Recebido:</span>
                                            <span className="font-medium text-green-600">
                                                {formatCurrency(order.total_amount - (order.boca_value ?? order.total_amount))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold border-t border-zinc-100 pt-1">
                                            <span className="text-zinc-900">Saldo Devedor:</span>
                                            <span className="text-red-600">
                                                {formatCurrency(order.boca_value ?? order.total_amount)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between text-sm pt-1 border-t border-zinc-200">
                                        <span className="text-zinc-500">Valor Total Pago:</span>
                                        <span className="font-bold text-green-600">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Payment History Log */}
                            {payments.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                        <History className="h-3 w-3" /> Histórico de Recebimentos
                                    </h4>
                                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                                        {payments.map((p) => (
                                            <div key={p.id} className="flex justify-between items-center text-[10px] bg-zinc-50 p-2 rounded border border-zinc-100">
                                                <div>
                                                    <span className="font-bold text-green-600">{formatCurrency(p.amount)}</span>
                                                    <span className="text-zinc-400 mx-1">•</span>
                                                    <span className="uppercase text-zinc-500">{p.payment_method}</span>
                                                    <span className="text-zinc-400 italic ml-1">por {p.receiver_name}</span>
                                                </div>
                                                <span className="text-zinc-400">{formatDate(p.created_at)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {loadingPayments && payments.length === 0 && (
                                <div className="mt-4 animate-pulse text-[10px] text-zinc-400">Carregando histórico...</div>
                            )}
                        </section>
                    </div>

                    {/* Items */}
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4 text-[var(--lumike-gold)]" /> Itens do Pedido
                        </h3>
                        <div className="border border-zinc-100 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-50 border-b border-zinc-100">
                                    <tr>
                                        <th className="py-2 px-4 text-left font-medium text-zinc-600">Produto</th>
                                        <th className="py-2 px-4 text-center font-medium text-zinc-600">Qtd</th>
                                        <th className="py-2 px-4 text-right font-medium text-zinc-600">Unitário</th>
                                        <th className="py-2 px-4 text-right font-medium text-zinc-600">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {order.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-3 px-4 text-zinc-900">
                                                {item.products?.name}
                                                {item.products?.sku && (
                                                    <span className="block text-[10px] text-zinc-400">SKU: {item.products.sku}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center text-zinc-600">{item.quantity}</td>
                                            <td className="py-3 px-4 text-right text-zinc-600">{formatCurrency(item.unit_price)}</td>
                                            <td className="py-3 px-4 text-right font-medium text-zinc-900">{formatCurrency(item.total_price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-zinc-50/50">
                                    <tr>
                                        <td colSpan={3} className="py-3 px-4 text-right font-semibold text-zinc-900 text-lg">
                                            Total do Pedido
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-[var(--lumike-gold)] text-lg">
                                            {formatCurrency(order.total_amount)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>

                    {/* Notes */}
                    {order.notes && (
                        <section>
                            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-2">Observações</h3>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                                {order.notes}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-4">
                    {order.status !== 'cancelled' && !isCancelling && (
                        <div className="flex justify-between items-center w-full">
                            <button
                                onClick={() => setIsCancelling(true)}
                                className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                            >
                                <X className="h-4 w-4" /> Cancelar Venda
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition font-medium"
                            >
                                Fechar
                            </button>
                        </div>
                    )}

                    {isCancelling && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-4">
                            <h4 className="font-bold text-red-900 text-sm">Configuração de Cancelamento</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-red-700 uppercase mb-1">Valor a Devolver (Estorno)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-red-400">R$</span>
                                        <input
                                            type="number"
                                            value={refundAmount}
                                            onChange={(e) => setRefundAmount(Number(e.target.value))}
                                            max={totalRecebido}
                                            className="w-full pl-9 pr-4 py-2 border border-red-200 rounded-md focus:ring-red-500 focus:border-red-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-[10px] text-red-500 mt-1">Máximo disponível: R$ {totalRecebido.toFixed(2)}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-red-700 uppercase mb-1">Motivo / Notas</label>
                                    <textarea
                                        value={cancelNotes}
                                        onChange={(e) => setCancelNotes(e.target.value)}
                                        className="w-full px-4 py-2 border border-red-200 rounded-md text-sm"
                                        placeholder="Ex: Cliente desistiu, devolvido com multa..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsCancelling(false)}
                                    className="px-4 py-2 text-zinc-600 hover:text-zinc-900 text-sm font-medium"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={submittingCancel}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2"
                                >
                                    {submittingCancel ? 'Processando...' : 'Confirmar Cancelamento'}
                                </button>
                            </div>
                        </div>
                    )}

                    {order.status === 'cancelled' && (
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition font-medium"
                            >
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
