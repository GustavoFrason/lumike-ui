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

  // Tamanho de página explícito pro @page abaixo — largura da bobina inteira
  // (todas as columnsPerRow colunas), altura de uma fileira. Ver comentário
  // de getPrintPageSizeMm: "size: auto" deixava a impressão usar o tamanho
  // de página já configurado no driver da impressora, que podia não bater
  // com a largura real da bobina e cortar etiquetas da fileira.
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
        <button
          onClick={handlePrint}
          disabled={labelList.length === 0}
          className="flex items-center gap-2 bg-(--lumilee-gold) text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-orange-100"
        >
          <Printer className="h-5 w-5" />
          Imprimir ({labelList.length} Etiquetas)
        </button>
      </div>

      <ErrorMessage message={errorProducts || ''} />

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
            /* Tamanho real da bobina (todas as colunas), não "auto" — ver
               comentário de getPrintPageSizeMm em components/types.ts. */
            size: ${printPageSize.width}mm ${printPageSize.height}mm;
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
