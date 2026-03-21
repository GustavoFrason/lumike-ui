'use client';

import { useState, useEffect, useRef } from 'react';
import { useProducts } from '@/lib/hooks/use-products';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@/lib/formatters';
import Link from 'next/link';
import { ArrowLeft, Printer, Search } from 'lucide-react';
import { Product } from '@/lib/services/products.service';

export default function EtiquetasPage() {
  const { products, loadingProducts, errorProducts, loadProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Configurações de impressão
  const [config, setConfig] = useState({
    width: 40, // mm
    height: 25, // mm
    fontSize: 10, // px
    qrSize: 60, // px (visual)
  });

  useEffect(() => {
    // Carrega produtos (pagination false para pegar tudo, se a API suportar, ou limit alto)
    loadProducts(1, 200, true);
  }, [loadProducts]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function toggleProduct(product: Product) {
    if (selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  }

  function selectAllFiltered() {
    // Adiciona apenas os que não estão selecionados
    const newSelection = [...selectedProducts];
    filteredProducts.forEach((p) => {
      if (!newSelection.find((s) => s.id === p.id)) {
        newSelection.push(p);
      }
    });
    setSelectedProducts(newSelection);
  }

  function deselectAll() {
    setSelectedProducts([]);
  }

  function handlePrint() {
    window.print();
  }

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
          disabled={selectedProducts.length === 0}
          className="flex items-center gap-2 bg-[var(--lumike-gold)] text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition"
        >
          <Printer className="h-5 w-5" />
          Imprimir ({selectedProducts.length})
        </button>
      </div>

      <ErrorMessage message={errorProducts || ''} />

      {/* Config Area - Hidden on Print */}
      <div className="print:hidden bg-white p-4 rounded-lg border border-zinc-200 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-500">Largura (mm)</label>
          <input
            type="number"
            value={config.width}
            onChange={(e) => setConfig({ ...config, width: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Altura (mm)</label>
          <input
            type="number"
            value={config.height}
            onChange={(e) => setConfig({ ...config, height: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Fonte (px)</label>
          <input
            type="number"
            value={config.fontSize}
            onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">QR Size (px)</label>
          <input
            type="number"
            value={config.qrSize}
            onChange={(e) => setConfig({ ...config, qrSize: Number(e.target.value) })}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Selection Area - Hidden on Print */}
      <div className="print:hidden grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg border border-zinc-200 md:col-span-1 h-[calc(100vh-280px)] flex flex-col">
          <div className="mb-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAllFiltered}
                className="text-xs text-[var(--lumike-gold)] hover:underline"
              >
                Selecionar Tudo
              </button>
              <button onClick={deselectAll} className="text-xs text-red-500 hover:underline">
                Limpar Seleção
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => toggleProduct(product)}
                className={`p-3 rounded border cursor-pointer hover:bg-zinc-50 transition ${
                  selectedProducts.find((p) => p.id === product.id)
                    ? 'border-[var(--lumike-gold)] bg-yellow-50/10 ring-1 ring-[var(--lumike-gold)]'
                    : 'border-zinc-200'
                }`}
              >
                <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>{product.sku || 'S/ SKU'}</span>
                  <span>{formatCurrency(product.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Area - Hidden on Print */}
        <div className="bg-zinc-100 p-8 rounded-lg border border-zinc-200 md:col-span-2 overflow-y-auto h-[calc(100vh-280px)]">
          {selectedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <Printer className="h-12 w-12 mb-4 opacity-20" />
              <p>Selecione produtos para visualizar as etiquetas</p>
            </div>
          ) : (
            <div className="flex flex-wrap content-start gap-1">
              {selectedProducts.map((product, idx) => (
                <div
                  key={`${product.id}-${idx}`}
                  className="bg-white border border-dashed border-zinc-300 flex items-center overflow-hidden relative"
                  style={{
                    width: `${config.width}mm`,
                    height: `${config.height}mm`,
                    padding: '2px',
                  }}
                >
                  <LabelContent product={product} config={config} />
                  <div className="absolute inset-0 border-2 border-transparent hover:border-blue-500 pointer-events-none transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Print Area - Only visible when printing */}
      <div className="hidden print:block">
        <div className="flex flex-wrap content-start gap-0">
          {selectedProducts.map((product, idx) => (
            <div
              key={`${product.id}-${idx}-print`}
              className="break-inside-avoid overflow-hidden flex items-center"
              style={{
                width: `${config.width}mm`,
                height: `${config.height}mm`,
                padding: '2px', // Margem de segurança
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

function LabelContent({
  product,
  config,
}: {
  product: Product;
  config: { fontSize: number; qrSize: number };
}) {
  return (
    <div className="w-full h-full flex items-center gap-1">
      <div className="flex-shrink-0">
        <QRCodeSVG value={product.sku || product.id.toString()} size={config.qrSize} level="L" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center h-full leading-none">
        <p
          className="font-bold line-clamp-2"
          style={{ fontSize: `${config.fontSize}px`, lineHeight: '1.1' }}
        >
          {product.name}
        </p>
        <p
          className="font-mono text-zinc-600 mt-0.5"
          style={{ fontSize: `${Math.max(8, config.fontSize - 2)}px` }}
        >
          {product.sku}
        </p>
        <p className="font-bold mt-0.5" style={{ fontSize: `${config.fontSize + 2}px` }}>
          {formatCurrency(product.preco_promocional || product.price)}
        </p>
      </div>
    </div>
  );
}
