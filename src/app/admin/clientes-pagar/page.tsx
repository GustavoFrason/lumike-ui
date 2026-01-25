'use client';

import { useState, useEffect, useCallback } from 'react';
import { accountsReceivableService, Debtor } from '@/lib/services/accounts-receivable.service';
import { Loading } from '@/components/ui/loading';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ChevronDown, ChevronUp, DollarSign, Send, Phone } from 'lucide-react';
import CurrencyInput from 'react-currency-input-field';

export default function AccountsReceivablePage() {
    const [debtors, setDebtors] = useState<Debtor[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null);

    // Payment State
    const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [processingPayment, setProcessingPayment] = useState(false);

    // History State
    const [paymentHistory, setPaymentHistory] = useState<Record<number, any[]>>({});
    const [loadingHistory, setLoadingHistory] = useState<Record<number, boolean>>({});

    const loadDebtors = useCallback(async () => {
        setLoading(true);
        try {
            const data = await accountsReceivableService.getDebtors();
            setDebtors(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHistory = async (orderId: number) => {
        setLoadingHistory(prev => ({ ...prev, [orderId]: true }));
        try {
            const history = await accountsReceivableService.getOrderPayments(orderId);
            setPaymentHistory(prev => ({ ...prev, [orderId]: history }));
        } catch (err) {
            console.error('Erro ao buscar histórico:', err);
        } finally {
            setLoadingHistory(prev => ({ ...prev, [orderId]: false }));
        }
    };

    useEffect(() => {
        loadDebtors();
    }, [loadDebtors]);

    function toggleExpand(customerId: number) {
        if (expandedCustomer !== customerId) {
            const debtor = debtors.find(d => d.customer_id === customerId);
            debtor?.orders.forEach(order => {
                if (!paymentHistory[order.id]) {
                    fetchHistory(order.id);
                }
            });
        }
        setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
    }

    function startPayment(orderId: number, amount: number) {
        setPayingOrderId(orderId);
        setPaymentAmount(amount.toString().replace('.', ','));
        setPaymentMethod('pix');
    }

    async function handlePayment(orderId: number) {
        if (!paymentAmount) return;
        setProcessingPayment(true);
        try {
            const numericAmount = parseFloat(paymentAmount.replace(/\./g, '').replace(',', '.'));
            await accountsReceivableService.markAsPaid(orderId, numericAmount, paymentMethod);
            await loadDebtors();
            await fetchHistory(orderId);
            setPayingOrderId(null);
        } catch (err) {
            alert('Erro ao registrar pagamento');
        } finally {
            setProcessingPayment(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold font-playfair">Contas a Receber (Fiado/Aberto)</h1>
                <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg font-medium border border-red-100">
                    Total a Receber: {formatCurrency(debtors.reduce((sum, d) => sum + d.total_debt, 0))}
                </div>
            </div>

            {loading ? (
                <Loading />
            ) : debtors.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 bg-white rounded-lg border border-dashed">
                    Nenhum débito em aberto encontrado.
                </div>
            ) : (
                <div className="space-y-4">
                    {debtors.map((debtor) => (
                        <div key={debtor.customer_id} className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition"
                                onClick={() => toggleExpand(debtor.customer_id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-red-100 p-2 rounded-full text-red-600">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900">{debtor.customer_name}</h3>
                                        <div className="flex gap-3 text-sm text-zinc-500">
                                            <span>{debtor.orders_count} compra(s) pendente(s)</span>
                                            {debtor.customer_phone && (
                                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {debtor.customer_phone}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-red-600">{formatCurrency(debtor.total_debt)}</span>
                                    {expandedCustomer === debtor.customer_id ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
                                </div>
                            </div>

                            {expandedCustomer === debtor.customer_id && (
                                <div className="border-t border-zinc-100 bg-zinc-50 p-4 space-y-3 animate-in slide-in-from-top-2">
                                    {debtor.orders.map(order => (
                                        <div key={order.id} className="space-y-2">
                                            <div className="bg-white p-3 rounded border border-zinc-200 flex justify-between items-center text-sm">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                                    <div>
                                                        <span className="block text-xs text-zinc-500">Data</span>
                                                        <span className="font-medium">{formatDate(order.date)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-zinc-500">Valor</span>
                                                        <span className="font-bold text-red-600">{formatCurrency(order.amount)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-zinc-500">Obs</span>
                                                        <span className="text-zinc-600 truncate max-w-[200px]">{order.notes || '-'}</span>
                                                    </div>
                                                </div>

                                                {payingOrderId === order.id ? (
                                                    <div className="flex flex-col md:flex-row items-end md:items-center gap-2 animate-in fade-in bg-green-50 p-2 rounded border border-green-100">
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] font-bold text-green-700 uppercase">Valor do Pagamento</label>
                                                            <div className="w-32">
                                                                <CurrencyInput
                                                                    autoFocus
                                                                    value={paymentAmount}
                                                                    onValueChange={(val) => setPaymentAmount(val || '')}
                                                                    prefix="R$ "
                                                                    className="w-full border rounded px-2 py-1 text-sm border-green-300 focus:ring-green-300"
                                                                    intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] font-bold text-green-700 uppercase">Forma</label>
                                                            <select
                                                                value={paymentMethod}
                                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                                className="text-sm border rounded px-2 py-1 border-green-300 bg-white"
                                                            >
                                                                <option value="pix">Pix</option>
                                                                <option value="dinheiro">Dinheiro</option>
                                                                <option value="cartao">Cartão</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handlePayment(order.id); }}
                                                                disabled={processingPayment}
                                                                className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 text-xs font-bold px-3 transition shadow-sm"
                                                                title="Confirmar Pagamento"
                                                            >
                                                                {processingPayment ? '...' : <><Send className="h-3.5 w-3.5" /> Confirmar</>}
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setPayingOrderId(null); }}
                                                                className="text-zinc-500 hover:text-zinc-700 text-xs font-medium px-2"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); startPayment(order.id, order.amount); }}
                                                        className="text-green-600 hover:text-green-800 font-medium text-xs border border-green-200 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100 transition flex items-center gap-1 shadow-sm"
                                                    >
                                                        <DollarSign className="h-3 w-3" /> Pagar
                                                    </button>
                                                )}
                                            </div>

                                            {/* Payment History Log */}
                                            {paymentHistory[order.id] && paymentHistory[order.id].length > 0 && (
                                                <div className="ml-4 border-l-2 border-zinc-200 pl-4 py-2 space-y-2">
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Histórico de Recebimentos</p>
                                                    {paymentHistory[order.id].map((pay: any) => (
                                                        <div key={pay.id} className="flex items-center justify-between text-xs text-zinc-600 bg-zinc-100/50 p-2 rounded">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-green-700">{formatCurrency(pay.amount)}</span>
                                                                <span className="bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-500 uppercase font-bold text-[9px]">{pay.payment_method}</span>
                                                                <span className="text-zinc-400 italic">por {pay.receiver_name}</span>
                                                            </div>
                                                            <span className="text-zinc-400">{formatDate(pay.created_at)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {loadingHistory[order.id] && (
                                                <div className="ml-4 py-1 text-[10px] text-zinc-400 animate-pulse">Carregando histórico...</div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex justify-end pt-2">
                                        <button className="text-xs text-[var(--lumike-gold)] hover:underline flex items-center gap-1 opacity-50 cursor-not-allowed" title="Em breve">
                                            <Send className="h-3 w-3" /> Enviar Cobrança WhatsApp
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
