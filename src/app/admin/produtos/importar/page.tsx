'use client';

import { useState } from 'react';
import { FileCode, Check, AlertCircle } from 'lucide-react';
import { productsService, ImportItem, ImportResponse } from '@/lib/services/products.service';
import { formatCurrency } from '@/lib/formatters';
import { Loading } from '@/components/ui/loading';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [importData, setImportData] = useState<ImportResponse | null>(null);
    const [items, setItems] = useState<ImportItem[]>([]);

    // Step 1: Upload
    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            const data = await productsService.importFile(file);
            setImportData(data);
            setItems(data.items);
            setStep(2);
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Erro ao ler arquivo';
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    // Step 2: Review Actions
    function updateItem(index: number, field: keyof ImportItem, value: ImportItem[keyof ImportItem]) {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    }

    // Step 3: Confirm
    async function handleConfirm() {
        setLoading(true);
        setError('');
        try {
            const result = await productsService.confirmImport(items);
            alert(`Importação concluída!\nCriados: ${result.created}\nAtualizados: ${result.updated}\nErros: ${result.errors}`);
            router.push('/admin/produtos');
        } catch (err: unknown) {
            console.error(err);
            setError('Erro ao processar importação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loading size="lg" text={step === 1 ? "Lendo arquivo..." : "Processando importação..."} />
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Importar Produtos (XLSX / XML)</h1>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {step === 1 && (
                <div className="max-w-xl mx-auto mt-12">
                    <label
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer bg-white hover:bg-zinc-50 transition"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileCode className="w-12 h-12 mb-4 text-zinc-400" />
                            <p className="mb-2 text-sm text-zinc-500">
                                <span className="font-semibold">Clique para enviar</span> ou arraste o arquivo
                            </p>
                            <p className="text-xs text-zinc-500">Planilha (XLSX) ou Nota Fiscal Eletrônica (XML)</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept=".xml,.xlsx,.xls"
                            onChange={handleFileUpload}
                        />
                    </label>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-100 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-zinc-500">Nota Fiscal</p>
                            <p className="font-mono text-xs text-zinc-400">{importData?.nfeId}</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1 text-emerald-600">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Atualizar Estoque
                            </span>
                            <span className="flex items-center gap-1 text-blue-600">
                                <div className="w-2 h-2 rounded-full bg-blue-500" /> Novo Cadastro
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-zinc-600 font-medium border-b border-zinc-200">
                                <tr>
                                    <th className="px-4 py-3">SKU</th>
                                    <th className="px-4 py-3">Produto</th>
                                    <th className="px-4 py-3">Qtd Nota</th>
                                    <th className="px-4 py-3">Custo Unit.</th>
                                    <th className="px-4 py-3">Situação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {items.map((item, idx) => (
                                    <tr key={idx} className={item.action === 'UPDATE_STOCK' ? 'bg-emerald-50/30' : 'bg-blue-50/30'}>
                                        <td className="px-4 py-3 font-mono text-zinc-500">{item.sku}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    type="text"
                                                    value={item.name_xml}
                                                    onChange={(e) => updateItem(idx, 'name_xml', e.target.value)}
                                                    className="bg-transparent border-b border-transparent focus:border-[var(--lumike-gold)] outline-none w-full"
                                                />
                                                {item.existing_product && (
                                                    <span className="text-xs text-zinc-400">Atual: {item.existing_product.name}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            +{item.quantity_xml}
                                            {item.existing_product && (
                                                <span className="text-zinc-400 font-normal ml-1">
                                                    ( {'->'} {item.existing_product.current_stock + item.quantity_xml})
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{formatCurrency(item.cost_price_xml)}</td>
                                        <td className="px-4 py-3">
                                            {item.action === 'UPDATE_STOCK' ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                    Atualizar
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    Novo
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setStep(1)}
                            className="px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-[var(--lumike-gold)] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                        >
                            <Check size={18} /> Confirmar Importação
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
