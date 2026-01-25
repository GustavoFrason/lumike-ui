'use client';

import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function GarantiasPage() {
    return (
        <section className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Garantias' },
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-zinc-900">Gestão de Garantias</h1>
                    <p className="text-zinc-500">Consulte e gerencie as políticas e termos de garantia Lumike.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-zinc-900">Garantia Vitalícia</h3>
                    <p className="text-sm text-zinc-500 mt-1">Válida para o banho de ouro 18k e ródio.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-zinc-900">Prazo de Troca</h3>
                    <p className="text-sm text-zinc-500 mt-1">7 dias para devolução e 30 dias para trocas.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-zinc-900">Certificado Digital</h3>
                    <p className="text-sm text-zinc-500 mt-1">Cada peça acompanha um QR Code exclusivo.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-zinc-900">Suporte Premium</h3>
                    <p className="text-sm text-zinc-500 mt-1">Atendimento dedicado para pós-venda.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-zinc-900 font-serif">Termos de Garantia Atuais</h2>
                </div>
                <div className="p-6 prose prose-zinc max-w-none text-zinc-600">
                    <p>A Lumike Semijoias oferece garantia vitalícia no banho de suas peças, reafirmando nosso compromisso com a excelência e durabilidade.</p>

                    <h4 className="text-zinc-900 font-semibold mt-4">O que a garantia cobre:</h4>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Defeitos de fabricação comprovados.</li>
                        <li>Desprendimento total ou parcial do banho.</li>
                        <li>Oxidação natural excessiva fora dos padrões de uso.</li>
                    </ul>

                    <h4 className="text-zinc-900 font-semibold mt-6">O que a garantia NÃO cobre:</h4>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Peças quebradas, riscadas ou amassadas por mau uso.</li>
                        <li>Perda de pedras ou zircônias por impacto.</li>
                        <li>Danos causados por contato com produtos químicos (perfumes, cremes, cloro).</li>
                        <li>Peças escurecidas por sujeira ou acúmulo de resíduos (limpeza simples resolve).</li>
                    </ul>

                    <div className="mt-8 p-4 bg-[var(--lumike-taupe)]/5 rounded-lg border border-[var(--lumike-taupe)]/20 italic">
                        &quot;Elegância é a única beleza que nunca desaparece.&quot; — Audrey Hepburn
                    </div>
                </div>
            </div>
        </section>
    );
}
