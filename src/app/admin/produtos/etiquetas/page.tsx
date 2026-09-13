'use client';

import { useState, useEffect } from 'react';
import { useProducts } from '@/lib/hooks/use-products';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { Product } from '@/lib/services/products.service';
import {
  DEFAULT_LABEL_CONFIG,
  LabelConfig,
  getLabelGridStyle,
  getPrintPageSizeMm,
} from './components/types';
import { LabelContent } from './components/LabelContent';
import { LabelPrintConfigPanel } from './components/LabelPrintConfigPanel';
import { ProductSelectionList } from './components/ProductSelectionList';
import { LabelPreviewGrid } from './components/LabelPreviewGrid';
import { testQzConnection, type QzConnectionResult } from '@/lib/services/qz-print.service';

export default function EtiquetasPage() {
  const { products, loadingProducts, errorProducts, loadProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  // Novo estado: Map de id -> quantidade
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});

  // Configurações de impressão — parte de DEFAULT_LABEL_CONFIG (components/types.ts),
  // a etiqueta física já usada nas peças hoje. Não duplica os valores aqui:
  // se o default mudar lá, a página acompanha sozinha.
  const [config, setConfig] = useState<LabelConfig>(() => ({ ...DEFAULT_LABEL_CONFIG }));

  useEffect(() => {
    // Carrega produtos (pagination false para pegar tudo, se a API suportar, ou limit alto)
    loadProducts(1, 200, true);
  }, [loadProducts]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku2?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function updateQuantity(productId: number, delta: number) {
    setSelectedQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      }
      return { ...prev, [productId]: next };
    });
  }

  function selectAllFiltered() {
    const newQuantities = { ...selectedQuantities };
    filteredProducts.forEach((p) => {
      if (!newQuantities[p.id]) {
        newQuantities[p.id] = 1;
      }
    });
    setSelectedQuantities(newQuantities);
  }

  function deselectAll() {
    setSelectedQuantities({});
  }

  // Gera a lista plana de produtos para repetição de etiquetas
  const labelList: Product[] = [];
  Object.entries(selectedQuantities).forEach(([id, qty]) => {
    const product = products.find((p) => p.id === Number(id));
    if (product) {
      for (let i = 0; i < qty; i++) {
        labelList.push(product);
      }
    }
  });

  function handlePrint() {
    window.print();
  }

  // Diagnóstico temporário: confirma que o QZ Tray (programinha local que
  // permite mandar comando direto pra impressora, sem passar pelo
  // window.print()/Chrome) está instalado, rodando e enxergando a
  // impressora — passo anterior a montar o gerador de ZPL de verdade.
  const [qzTest, setQzTest] = useState<{ loading: boolean; result: QzConnectionResult | null }>({
    loading: false,
    result: null,
  });

  async function handleTestQz() {
    setQzTest({ loading: true, result: null });
    const result = await testQzConnection();
    setQzTest({ loading: false, result });
  }

  // Só EXIBIDO pro usuário (ver dica abaixo do botão Imprimir) — não força
  // mais o @page (ver comentário na tag <style> no fim do arquivo: setar o
  // tamanho de página via CSS não é respeitado de forma confiável pelo
  // Chrome ao imprimir numa impressora física de verdade, só ao salvar PDF).
  const printPageSize = getPrintPageSizeMm(config);

  if (loadingProducts && products.length === 0) {
    return <Loading size="lg" text="Carregando produtos..." className="py-12" />;
  }

  return (
    <div className="space-y-6">
      {/* Header - Hidden on Print */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/produtos" className="text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Gerar Etiquetas</h1>
            <p className="text-sm text-zinc-500">Configure o tamanho e imprima QR Codes</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handlePrint}
            disabled={labelList.length === 0}
            className="flex items-center gap-2 bg-(--lumilee-gold) text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-orange-100"
          >
            <Printer className="h-5 w-5" />
            Imprimir ({labelList.length} Etiquetas)
          </button>
          {/* O Chrome não respeita de forma confiável um tamanho de página
              forçado por CSS ao imprimir numa impressora física (só ao
              salvar PDF) — por isso não fica só no código: se o driver da
              impressora permitir cadastrar um tamanho de papel
              personalizado, é esse o número a usar lá. */}
          <p className="text-[11px] text-zinc-400 max-w-[220px] text-right">
            No diálogo de impressão: desligue &quot;Cabeçalhos e rodapés&quot; e, se o
            driver permitir papel personalizado, use{' '}
            <strong>
              {printPageSize.width}x{printPageSize.height}mm
            </strong>
            .
          </p>
        </div>
      </div>

      <ErrorMessage message={errorProducts || ''} />

      {/* Diagnóstico temporário do QZ Tray — remover quando a impressão via
          ZPL estiver pronta e substituir por um seletor de modo de impressão. */}
      <div className="print:hidden flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
        <button
          onClick={handleTestQz}
          disabled={qzTest.loading}
          className="text-xs font-medium bg-zinc-900 text-white px-3 py-1.5 rounded disabled:opacity-50"
        >
          {qzTest.loading ? 'Testando...' : 'Testar conexão QZ Tray'}
        </button>
        {qzTest.result && (
          <div className="text-xs">
            <p
              className={
                qzTest.result.status === 'connected' ? 'text-green-700' : 'text-red-600'
              }
            >
              {qzTest.result.message}
            </p>
            {qzTest.result.printers && qzTest.result.printers.length > 0 && (
              <p className="text-zinc-500 mt-0.5">
                Impressoras: {qzTest.result.printers.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>

      <LabelPrintConfigPanel config={config} onConfigChange={setConfig} />

      {/* Selection Area - Hidden on Print */}
      <div className="print:hidden grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProductSelectionList
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectAll={selectAllFiltered}
          onDeselectAll={deselectAll}
          products={filteredProducts}
          selectedQuantities={selectedQuantities}
          onUpdateQuantity={updateQuantity}
        />

        <LabelPreviewGrid labelList={labelList} config={config} onUpdateQuantity={updateQuantity} />
      </div>

      {/* Print Area - Only visible when printing */}
      <div className="hidden print:block">
        <div style={getLabelGridStyle(config)}>
          {labelList.map((product, idx) => (
            <div
              key={`${product.id}-${idx}-print`}
              className="break-inside-avoid overflow-hidden flex items-center"
              style={{
                width: `${config.width}mm`,
                height: `${config.height}mm`,
                padding: '1mm',
                pageBreakInside: 'avoid',
              }}
            >
              <LabelContent product={product} config={config} />
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            /* "auto" de propósito: setar um tamanho explícito aqui (ex:
               "89mm 15mm") NÃO é respeitado de forma confiável pelo Chrome
               ao imprimir numa impressora física — só funciona ao salvar
               como PDF. Numa impressora de verdade, se o tamanho não bater
               com nada que o driver conhece, o Chrome cai num tamanho
               padrão (Carta/A4), o que já causou uma impressão toda
               desconfigurada. O tamanho real da página é controlado pelo
               que estiver selecionado em "Tamanho do papel" no diálogo de
               impressão (idealmente um papel personalizado cadastrado no
               driver da impressora — ver dica ao lado do botão Imprimir). */
            size: auto;
            margin: 0mm;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
